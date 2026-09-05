/**
 * src/presence-channel.ts
 *
 * Ephemeral "who is here" over the Firebase Realtime Database.
 *
 * Why RTDB and not Firestore: presence needs `onDisconnect()`, where Firebase's
 * own servers watch the client's socket and clean up when it drops. Nothing
 * client-side can substitute for it — a browser that crashes, sleeps, or loses
 * power sends no goodbye, and a server behind an API has no idea the tab died.
 * Firestore has no equivalent, bills per write, and lands snapshots in 100-300ms.
 *
 * Everything written here is ephemeral by construction: each node is wrong the
 * moment its tab closes. Never read it back as a source of truth.
 *
 * Product-agnostic on purpose. It knows about sessions, connection state and
 * teardown; it knows nothing about what a "project" or a "page" is. Callers
 * supply the path, their identity, and whatever `location` means to them.
 */

import { getFirebaseApp } from '@xbg.solutions/bpsk-core';
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  update,
  remove,
  serverTimestamp,
  type Database,
  type DatabaseReference,
  type Unsubscribe,
} from 'firebase/database';
import type {
  PresenceChannel,
  PresenceChannelOptions,
  PresenceEntry,
  PresenceIdentity,
  PresenceLocation,
} from './types';

const DEFAULT_STALE_AFTER_MS = 5 * 60 * 1000;
const DEFAULT_HEARTBEAT_MS = 2 * 60 * 1000;

/** Shape of one session node as it sits in the database. */
interface SessionNode {
  identity?: PresenceIdentity;
  location?: PresenceLocation;
  idle?: boolean;
  joinedAt?: number;
  lastActiveAt?: number;
}

function logPresenceError(label: string | undefined, err: unknown): void {
  // Deliberately console-only. Presence failing is not worth interrupting
  // anyone over — the page is entirely usable without a roster, and a toast
  // saying an avatar strip is unavailable is pure noise. This is the opposite
  // posture to a work-product realtime surface, where silence would hide a
  // stalled result. Callers who genuinely need to react pass `onError`.
  console.error(`presence-channel failed${label ? ` (${label})` : ''}`, err);
}

/**
 * A per-tab id, generated once per module instance.
 *
 * Held in memory, NOT sessionStorage: duplicating a tab clones sessionStorage,
 * so two live tabs would claim one session id and the first to disconnect would
 * evict the other.
 */
function makeTabId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Collapse raw session nodes into one entry per user.
 *
 * A person with three tabs open is one person. Sessions are keyed per tab —
 * they have to be, or closing a second tab would delete someone still working
 * in their first — so the fan-in happens here on read.
 */
function foldSessions(
  raw: Record<string, SessionNode> | null,
  selfUserId: string,
  now: number,
  staleAfterMs: number,
): PresenceEntry[] {
  if (!raw) return [];
  const byUser = new Map<string, PresenceEntry>();

  for (const [sessionId, node] of Object.entries(raw)) {
    const userId = node?.identity?.userId ?? sessionId.split('__')[0];
    if (!userId || userId === selfUserId) continue;

    const lastActiveAt = typeof node?.lastActiveAt === 'number' ? node.lastActiveAt : null;
    // Sweep nodes `onDisconnect` never removed. A hard crash or a killed
    // process leaves the registration unfired, so the node outlives the tab.
    if (staleAfterMs > 0 && lastActiveAt !== null && now - lastActiveAt > staleAfterMs) continue;

    const joinedAt = typeof node?.joinedAt === 'number' ? node.joinedAt : null;
    const existing = byUser.get(userId);

    if (!existing) {
      byUser.set(userId, {
        userId,
        identity: node?.identity ?? { userId },
        location: node?.location ?? {},
        idle: node?.idle === true,
        joinedAt,
        lastActiveAt,
        sessionCount: 1,
      });
      continue;
    }

    // Merge: earliest join, latest activity, and the location of whichever tab
    // moved most recently. Idle only when EVERY tab of theirs is hidden.
    existing.sessionCount += 1;
    existing.idle = existing.idle && node?.idle === true;
    if (joinedAt !== null && (existing.joinedAt === null || joinedAt < existing.joinedAt)) {
      existing.joinedAt = joinedAt;
    }
    if (lastActiveAt !== null && (existing.lastActiveAt === null || lastActiveAt > existing.lastActiveAt)) {
      existing.lastActiveAt = lastActiveAt;
      if (node?.location) existing.location = node.location;
      if (node?.identity) existing.identity = node.identity;
    }
  }

  return [...byUser.values()].sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
}

/**
 * Join a presence channel. Returns synchronously with a teardown that is safe
 * to call before the async Firebase init has resolved.
 *
 * Typical Svelte 5 use — the teardown re-runs whenever a param changes:
 *
 *   $effect(() => {
 *     if (!projectId) return;
 *     const ch = createPresenceChannel({
 *       path: `presence/${projectId}`,
 *       identity: { userId, name, role },
 *       onRoster: (entries) => { roster = entries; },
 *     });
 *     return () => ch.stop();
 *   });
 */
export function createPresenceChannel(opts: PresenceChannelOptions): PresenceChannel {
  const staleAfterMs = opts.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;
  const heartbeatMs = opts.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
  const sessionId = `${opts.identity.userId}__${makeTabId()}`;

  let stopped = false;
  let db: Database | null = null;
  let sessionRef: DatabaseReference | null = null;
  let unsubRoster: Unsubscribe | null = null;
  let unsubConnected: Unsubscribe | null = null;
  let unsubOffset: Unsubscribe | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  // RTDB resolves serverTimestamp() against ITS clock, so comparing those
  // values to a local Date.now() imports the client's skew into the staleness
  // sweep. `.info/serverTimeOffset` is the correction RTDB publishes for it.
  let serverTimeOffset = 0;

  let location: PresenceLocation = { ...(opts.location ?? {}) };
  let idle = false;

  const fail = (err: unknown) => {
    logPresenceError(opts.label, err);
    opts.onError?.(err);
  };

  /** The full node. Used on (re)connect — `set` so a reconnect is a clean slate. */
  const writeSession = async (): Promise<void> => {
    if (!sessionRef || stopped) return;
    await set(sessionRef, {
      identity: opts.identity,
      location,
      idle,
      joinedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  };

  const touch = (patch: Record<string, unknown> = {}): void => {
    if (!sessionRef || stopped) return;
    void update(sessionRef, { ...patch, lastActiveAt: serverTimestamp() }).catch(fail);
  };

  const handleVisibility = (): void => {
    // Idle, never absent. Removing someone because they switched tabs makes the
    // roster untrustworthy at exactly the moment somebody glances at it.
    idle = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    touch({ idle });
  };

  void (async () => {
    // No window means SSR or a prerender pass: hold no socket, write nothing.
    if (typeof window === 'undefined') return;

    try {
      const app = await getFirebaseApp();
      if (stopped) return;

      db = opts.databaseURL ? getDatabase(app, opts.databaseURL) : getDatabase(app);
      sessionRef = ref(db, `${opts.path}/${sessionId}`);
      const rosterRef = ref(db, opts.path);

      unsubOffset = onValue(
        ref(db, '.info/serverTimeOffset'),
        (snap) => { serverTimeOffset = typeof snap.val() === 'number' ? snap.val() : 0; },
        fail,
      );

      unsubRoster = onValue(
        rosterRef,
        (snap) => {
          const now = Date.now() + serverTimeOffset;
          opts.onRoster(
            foldSessions(snap.val() as Record<string, SessionNode> | null, opts.identity.userId, now, staleAfterMs),
          );
        },
        fail,
      );

      unsubConnected = onValue(
        ref(db, '.info/connected'),
        (snap) => {
          if (snap.val() !== true || stopped || !sessionRef) return;
          // THE trap. An onDisconnect registration is CONSUMED when it fires,
          // and it is discarded server-side when the connection drops. After a
          // reconnect there is none, so the next tab close leaves a node that
          // nothing will ever remove. Re-register on every transition to
          // connected, and do it BEFORE writing — registering after leaves a
          // window in which a live node has no cleanup attached to it.
          onDisconnect(sessionRef)
            .remove()
            .then(() => writeSession())
            .catch(fail);
        },
        fail,
      );

      document.addEventListener('visibilitychange', handleVisibility);
      handleVisibility();

      // Keeps a live-but-quiet tab out of the staleness sweep. Cheap: one small
      // write every couple of minutes, per tab.
      if (heartbeatMs > 0) heartbeat = setInterval(() => touch(), heartbeatMs);
    } catch (err) {
      fail(err);
    }
  })();

  return {
    updateLocation(patch: PresenceLocation): void {
      location = { ...location, ...patch };
      touch({ location });
    },

    stop(): void {
      if (stopped) return;
      stopped = true;

      if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      unsubRoster?.(); unsubRoster = null;
      unsubConnected?.(); unsubConnected = null;
      unsubOffset?.(); unsubOffset = null;

      if (sessionRef) {
        const r = sessionRef;
        sessionRef = null;
        // Cancel the registration first: leaving it armed on a connection that
        // stays open (SPA navigation away, not a tab close) means it fires much
        // later against a path this channel no longer owns.
        void onDisconnect(r).cancel().catch(() => undefined);
        void remove(r).catch(() => undefined);
      }
    },
  };
}
