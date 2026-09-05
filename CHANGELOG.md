# Changelog

Consumer-facing detail lives in `UPGRADING.md`.

## 2.2.0 — in progress (not published)
- New `bpsk-utils-presence` (presence channel and types); bpsk-core bumped to 2.2.0 as its
  peer. All other packages still need aligning to 2.2.0 before publish (RELEASING.md).
- Carries everything from 2.1.1 below.

## 2.1.1 — 2026-09-05 (committed, tagged, not published; superseded by 2.2.0)
- Compiled ESM carries explicit `.js` / `/index.js` extensions
  (`scripts/add-js-extensions.mjs` runs after `tsc` in every package build) so plain
  Node — and therefore SvelteKit prerender — can load `lib/`.
- `bpsk-utils-firebase-auth` and `bpsk-utils-file-upload` accept `firebase ^11 || ^12`
  (verified: full suite on 12.18).

## 2.1.0 — 2026-09-05
- `bpsk-core` (and sibling utils) are peerDependencies of every util and of
  `bpsk-test-utils`; consumers must list `bpsk-core` themselves. Stops npm nesting a
  second core with its own module-level Firebase/toast/logger state.
- `bpsk-utils-firebase-auth`: static `clearStoredEmail` import during logout.
- `UPGRADING.md` added; `docs/distribution-architecture.md` corrected (a caret range
  never crosses a major).
- `scripts/publish-all.sh`.

## 2.0.0 — 2026-07-02
- No API change. `X-XSS-Protection: 0`, `payment=()` in Permissions-Policy,
  `sanitizeHtml` safe during SSR/prerender; internal ranges `^1.0.0` → `^2.0.0`.
  The major number matched backend-core's 2.0 released the same day.

## 1.2.7 — 2026-04-10
- Last release on the 1.x line.
