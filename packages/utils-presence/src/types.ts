/**
 * src/types.ts
 * Types for the presence channel.
 */

/** Who the local participant is. Supplied by the product, echoed to peers. */
export interface PresenceIdentity {
  /** Stable platform user id. Two tabs of the same person share this. */
  userId: string;
  /** Anything else the product wants peers to see — name, role, avatar url. */
  [key: string]: unknown;
}

/** Free-form location patch: whatever "where are you" means to the product. */
export type PresenceLocation = Record<string, unknown>;

/** One participant, as handed to `onRoster`. Deduplicated to one per user. */
export interface PresenceEntry {
  userId: string;
  /** Identity fields as written by that peer. */
  identity: PresenceIdentity;
  /** Their most recent location patch. */
  location: PresenceLocation;
  /** True when every one of that user's tabs is hidden. */
  idle: boolean;
  /** Server-clock ms. Earliest join across that user's tabs. */
  joinedAt: number | null;
  /** Server-clock ms. Latest activity across that user's tabs. */
  lastActiveAt: number | null;
  /** How many tabs this person has open on this path. */
  sessionCount: number;
}

export interface PresenceChannelOptions {
  /**
   * Collection path the roster lives under, e.g. `presence/${projectId}`.
   * Sessions are written as children of it. No leading or trailing slash.
   */
  path: string;
  identity: PresenceIdentity;
  /** Initial location. Optional — `updateLocation` can supply it later. */
  location?: PresenceLocation;
  /** Called on every roster change. Never includes the local user. */
  onRoster: (entries: PresenceEntry[]) => void;
  /**
   * Called on listener/write failure. Presence is decorative: the default is
   * to log and carry on, NOT to surface anything to the user. Supply this only
   * if the product genuinely wants to react.
   */
  onError?: (err: unknown) => void;
  /**
   * Sessions whose `lastActiveAt` is older than this are hidden on read.
   * Guards against nodes `onDisconnect` never got to remove (hard crash,
   * killed process). Default 5 minutes. Set 0 to disable.
   */
  staleAfterMs?: number;
  /**
   * Heartbeat interval. Refreshes `lastActiveAt` so a long-idle-but-live tab
   * is not swept by `staleAfterMs`. Default 2 minutes; must be well under it.
   */
  heartbeatMs?: number;
  /** Short label for diagnostics. */
  label?: string;
}

export interface PresenceChannel {
  /** Merge a location patch into the local session node. */
  updateLocation: (patch: PresenceLocation) => void;
  /** Remove the local session and detach every listener. Idempotent. */
  stop: () => void;
}
