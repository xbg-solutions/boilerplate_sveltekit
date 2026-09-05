# CLAUDE.md — boilerplate_sveltekit (bpsk)

The published `@xbg.solutions/bpsk-core` + `@xbg.solutions/bpsk-utils-*` packages that
every xbg SvelteKit frontend is built on, plus the `bpsk` CLI that scaffolds one. Read
this first; then `UPGRADING.md` for what each version asks of a consumer and
`RELEASING.md` before publishing.

## State (2026-09-05)

| | Working tree / git | On npm |
|---|---|---|
| `bpsk-core` | **2.2.0** (presence work in flight) | 2.1.0 |
| 17 `bpsk-utils-*`, `bpsk-test-utils`, `bpsk` CLI | 2.1.1 | 2.1.0 |
| `bpsk-utils-presence` (new) | 2.2.0, declares `bpsk-core ^2.2.0` | not published |

**Nothing since 2.1.0 is on the registry.** 2.1.1 (explicit `.js` extensions, `firebase
^11 || ^12`) is committed and tagged `bpsk-core@2.1.1` but was overtaken by the 2.2.0
presence work before it shipped; it ships inside 2.2.0. Because the presence package's
ranges say `^2.2.0`, **every package must be at 2.2.0 before `publish-all.sh` will
resolve** — align versions first (see RELEASING.md). Until then `npm install` at the root
fails with `ETARGET` on `bpsk-core@^2.2.0`; that is expected, not a bug to fix elsewhere.

Consumers, all installing from the registry at 2.1.0: accounts and build (core +
sanitizer only, on firebase 12), fediCRM (seven packages), sf-mapper and morph (core,
firebase-auth, api-client / tab-sync). morph used to vendor the packages as npm
workspaces; that is gone — never vendor again, it forks every package silently.

## What is in a "major" here

2.0.0 carried **no API change** (a header value, an SSR guard, range bumps) — the number
matched backend-core's 2.0 on the same day. Read the diff, not the number, when sizing a
bump; UPGRADING.md records exactly what each version changed.

## Peer dependencies (since 2.1.0)

Every util lists `bpsk-core` (and the sibling utils it builds on) under
`peerDependencies`, kept in `devDependencies` for the workspace build. bpsk-core holds
module-level state (the Firebase handle in `utils/firebase.ts`, the toast and logger
stores); two copies means two Firebase init states, silently. Keep it a peer. `firebase`
is a peer of `bpsk-utils-firebase-auth` and `bpsk-utils-file-upload` only, `^11 || ^12`
since 2.1.1 (the full suite was run on 12.18 before widening). A new package that needs
firebase declares that same range.

## Compiled output must load in plain Node

tsc (module ESNext, moduleResolution bundler) emits relative imports without extensions;
Vite resolves them, Node's ESM loader does not, and SvelteKit prerender runs in Node.
Since 2.1.1 every package's `build` script is `tsc && node ../../scripts/add-js-extensions.mjs lib`,
which rewrites each relative specifier to its resolved `.js` / `/index.js` and fails on
anything unresolved. Keep that step on every new package (`create-frontend` is the one
exception: its ESM lib is not what consumers use and its tsc has ~400 pre-existing
`.svelte` type errors). Consumers on ≤2.1.0 carry `ssr.noExternal` / vitest
`server.deps.inline` for `@xbg.solutions/*` as the workaround.

## Gates

`npm run build:packages` (order matters in a fresh checkout — run it twice if a dependent
compiled before its dependency's `lib/` existed), `npm run check` (svelte-check, must be
0 errors 0 warnings), `npm test` (vitest unit + integration, ~870 tests). CI runs the
same. The registry components under `packages/create-frontend/src/registry` are
Svelte files copied into consumers, not compiled here.

## Publishing

Only Ben can publish (npm 2FA). `scripts/publish-all.sh` publishes core first, then the
utils in dependency order, skips what is already on the registry, logs to
`scripts/publish-logs/`, and runs `npm publish --auth-type=web` under `script(1)` so npm
keeps a TTY for the browser second factor. Details and the version-alignment step in
`RELEASING.md`. Tag every publish (`bpsk-core@X.Y.Z`).

## Language & spelling

Displayed language is English; user-facing copy uses **Australian/British spelling**
(`colour`, `organisation`, `centre`, `optimise`, `behaviour`, `licence`, `catalogue`,
`customise`, `authorise`, `analyse`). **US English is accepted in the codebase** —
identifiers, CSS properties/values, library APIs, and config keys stay US-spelled
(`color`, `center`, `initialize`, `background-color`, `text-center`, `Authorization`);
do NOT "correct" those. Rule of thumb: if a human reads it as words → AU/British; if a
machine parses it as a symbol → leave it US.

## Git

This is its own independent git repository. Run git operations (branch, commit, push)
from **inside this repo**. The parent `xbg/` folder is a coordination workspace, not a
repo — never commit from there. The checkout is shared with other sessions: stage by
explicit path, never `git add -A`, and treat untracked files you did not create as
someone else's work in progress. `packages/*/lib` is git-ignored build output.

## Storage-layer ownership

This is a **boilerplate/template** (`.firebaserc` default is the placeholder
`your-project-id`) — it owns no live database and deploys to no shared project as-is.
Changes here propagate to every SvelteKit service scaffolded from it, so:

- Do NOT wire this template to a real shared Firebase project, and never run
  `firebase deploy` against `xbgsolutions` (or any live project) from here.
- A scaffolded service reads the shared platform Auth pool and owns only its own
  Firestore database/paths; its client only ever reads its own data. Keep that boundary
  in the template. Frontends never touch Firestore directly — every read and write goes
  through the product's own API (platform-wide rule in `xbg/.claude/CLAUDE.md`).
