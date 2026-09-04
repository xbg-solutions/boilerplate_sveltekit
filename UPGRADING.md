# Upgrading

Read this before bumping `@xbg.solutions/bpsk-*` across a major. Each section
says what actually changed in the packages, so the bump can be sized from
facts rather than from svelte-check output.

Peer requirements (all versions): `svelte ^5`, `@sveltejs/kit ^2`; `firebase
^11` for `bpsk-utils-firebase-auth` and `bpsk-utils-file-upload` only.
`bpsk-core` and `bpsk-utils-sanitizer` have no Firebase peer, so a project that
consumes only those two may sit on any `firebase` version.

## 2.0.0 → 2.1.0 — `bpsk-core` becomes a peer dependency

Every `bpsk-utils-*` package and `bpsk-test-utils` now lists `bpsk-core` (and
any sibling `bpsk-utils-*` it builds on) under `peerDependencies` instead of
`dependencies`. **Your project must list `@xbg.solutions/bpsk-core` itself**
(every existing consumer already does).

Why: `bpsk-core` holds module-level state — the Firebase handle in
`utils/firebase.ts`, the toast and logger stores. With `dependencies`, npm
would quietly install a second copy of core under a util whenever the ranges
did not overlap, and the app would run two Firebase init states. npm now
warns instead of nesting.

Also in 2.1.0: `bpsk-utils-firebase-auth` imports `clearStoredEmail`
statically during logout (was a dynamic import; no behaviour change).

Bump: set every `@xbg.solutions/bpsk-*` range to `^2.1.0`, `npm install`,
`svelte-check`. No code changes are expected.

## 1.2.7 → 2.0.0 — no API changes

Despite the major number (chosen to match `backend-core` 2.0 on the same
day), the whole diff to `bpsk-core` source is:

- `config/security.ts`: `X-XSS-Protection` header set to `0` (the legacy
  auditor is deprecated; CSP is the defence) and `payment=()` added to
  `Permissions-Policy`.
- `config/security.ts`: `sanitizeHtml()` no longer throws during SSR and
  prerender — it falls back to entity escaping when `document` is undefined.
- Every util's internal range moved from `^1.0.0` to `^2.0.0`.

Elsewhere: comments only in `bpsk-utils-csrf` and `bpsk-utils-secure-storage`
(clarifying that neither is a confidentiality boundary — the double-submit
cookie cannot be HttpOnly from client JS, and the synchronous storage path is
plaintext), and small fixes in three registry components.

Every symbol exported by 1.2.7's `bpsk-core` index is still exported, under
the same name, by 2.0.0. `AuthResult` from `types/auth.types` is the canonical
one; the Firebase-shaped one is re-exported as `FirebaseAuthResult` — this was
already so in 1.2.7.

Bump: set every range to `^2.0.0` (or straight to `^2.1.0`), `npm install`,
`svelte-check`. Nothing else.

## Vendored copies

One consumer carried the packages as npm workspaces under
`frontend/packages/` rather than installing from the registry. Do not do
this: it forks every package silently. Delete the tree, add the packages you
import to `package.json`, and reinstall.

## General flow

1. Bump ranges in `frontend/package.json`; `npm install`.
2. `npm run check` (svelte-check) — must be 0 errors.
3. `npm run test:unit` where the project has one.
4. Build, and confirm the built bundle contains the string from
   `static/version.json` — a bundle without it is a dev build shipped by
   mistake (`NODE_ENV=development` in a `.env` does exactly that).
