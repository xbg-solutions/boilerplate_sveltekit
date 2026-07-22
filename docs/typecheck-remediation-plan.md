# boilerplate_sveltekit — svelte-check remediation plan

> **✅ COMPLETED 2026-07-22.** All groups executed (owner chose "fix in place" for the blocks/ gallery): `npm run check` → **0 errors**; `npx vite build` and `npx vitest run` (871 tests) green. One deviation from the recipes below: the C3 "Cannot find name" errors were NOT missing imports — the types existed but were **recursive** (`children?: Link[]` etc.), which svelte2tsx fails to resolve when declared in the instance script and referenced in the `$props()` annotation. Fix was moving each recursive type to a `<script module lang="ts">` block (exported). Remaining 434 warnings are pre-existing a11y/deprecation advisories, out of scope.
>
> **Warnings also cleared later on 2026-07-22: `npm run check` → 0 errors, 0 warnings.** Real fixes throughout (aria-labels on icon buttons, `for`/`id` label associations, closed self-closing tags, `$derived` conversions, `<svelte:component>`/`<svelte:self>`/`<slot>`/`on:click` deprecation rewrites, `:global()` on `.prose` selectors styling `@html` content). Two deliberate suppressions: (1) `svelte.config.js` `compilerOptions.warningFilter` silences only the `href="#"` placeholder-link advisory (gallery blocks use `#` by design); (2) ~30 inline `// svelte-ignore state_referenced_locally` comments where a `$state(prop)` initial snapshot is intentional because the variable is mutated later. Build + 871 tests re-verified green.

**Status at time of writing (2026-07-22): `npm run check` → 63 errors, 428 warnings in 157 files.**
Repo: `boilerplate_sveltekit/` (this is the frontend itself — `src/` is at the repo root).

## How to reproduce / verify

```bash
cd boilerplate_sveltekit
npx svelte-kit sync        # once, if .svelte-kit/ is missing
npm run check              # svelte-check --tsconfig ./tsconfig.json
```

Fix a group, re-run `npm run check`, watch the error count drop. When it hits **0 errors**, also run:
```bash
npx vite build                                             # must still succeed
npx vitest run                                             # tests must stay green
```

## Context — what was ALREADY fixed (do not redo)

A prior pass fixed 32 boilerplate-origin errors that a downstream app (`sf-mapper`) had inherited. Those fixes are already in this repo: `AUTH_ROUTES` import in `confirm`/`unauthorized`/`PhoneAuth`, `rate-limiter.ts`, `routes.config.ts`, `cache.service.ts` (+ new `CacheService.getStorage()`), `api-cache.service.ts`, `+error.svelte`, `ChartWrapper.svelte` (+ added `chart.js` dep), and `error-testing.ts` (jest→vi). **The 63 below are the remainder** — they live in files `sf-mapper` did not include (the generic `blocks/` gallery + a couple of route loaders), so they were never touched.

---

## STRATEGIC DECISION FIRST (ask the owner before Group C)

~53 of the 63 errors are in `src/lib/components/blocks/` — the **generic component gallery** (checkout, product-listing, settings, lp-navbar, sidebar, team-section, playground, calendar, gallery, etc.). Two paths:

- **Path A — Fix in place.** Repair each block (recipes below). Keeps the full gallery shippable. ~53 errors, mostly mechanical Svelte-5 runes fixes.
- **Path B — Prune.** If the boilerplate does not need to ship the full generic gallery (downstream apps like `sf-mapper` delete it wholesale as unused), delete the unused block categories and their barrel exports. This clears Group C instantly. **But** the boilerplate is the *source* other apps copy from, so the gallery may be intentional — confirm with the owner before deleting.

Groups A and B below are worth doing **regardless of the A/B choice** (they're real app-code bugs, not gallery cruft). Do those first.

---

## Group A — RouteGroup import (real bug, 4 errors) — SAME fix already applied elsewhere

`src/routes/+layout.ts` and `src/routes/+page.ts` import `AUTH_ROUTES` from `@xbg.solutions/bpsk-core`, which resolves to a *nav-group* `RouteGroup` whose `.SUCCESS` / `.SIGN_IN` / `.DEFAULT_POST_LOGIN_ROUTE` are **`undefined` at runtime** (a latent redirect bug, not just a type error). The correct value lives in the local `src/lib/constants/auth.constants.ts`.

**Fix:** in both files change
`import { AUTH_ROUTES } from '@xbg.solutions/bpsk-core';`
→ `import { AUTH_ROUTES } from '$lib/constants/auth.constants';`
(mirrors the already-fixed `confirm`/`unauthorized`/`PhoneAuth`).

Errors cleared: `+layout.ts:45,75,112`, `+page.ts:59`.

## Group B — missing `error/` barrel (1 error)

`src/lib/components/index.ts:5` does `export * from './error';` but `src/lib/components/error/` has no `index.ts` (only `ErrorBoundary.svelte`, `ErrorDisplay.svelte`).

**Fix:** create `src/lib/components/error/index.ts`:
```ts
export { default as ErrorBoundary } from './ErrorBoundary.svelte';
export { default as ErrorDisplay } from './ErrorDisplay.svelte';
```

---

## Group C — `blocks/` gallery (~53 errors) — by root cause

### C1. Variable literally named `state` collides with the `$state` rune (~18 errors)
Files: `blocks/settings/Settings01.svelte` (~11), `blocks/checkout/Checkout01.svelte` (~7).
Symptom: `Block-scoped variable '$state' used before its declaration` on every `$state()` line, plus `'state' implicitly has type 'any' … referenced in its own initializer`.
Cause: a line like `let state = $state('Rhode Island');` — naming a local `state` breaks rune resolution.
**Fix:** rename that variable (e.g. `state` → `stateRegion`) and update its template/handler usages. Re-check; the whole file's `$state` errors clear together.

### C2. Svelte-4-style `$derived` statement instead of `let x = $derived(…)` (~11 errors)
Files: `blocks/product-listing/ProductListing04.svelte`, `blocks/settings/Settings04.svelte`, `blocks/order-history/OrderHistory01.svelte`.
Symptom: `Unexpected token` / `Unexpected keyword or identifier` at the declaration line, then cascading `Cannot find name 'totalPages' | 'paginatedProducts' | 'filteredIntegrations'`.
Cause: code written as `$derived totalPages = Math.ceil(...)` (invalid). Must be a variable declaration.
**Fix:** rewrite each as
`let totalPages = $derived(Math.ceil(products.length / itemsPerPage));`
`let paginatedProducts = $derived(products.slice(...));`
Fixing the declaration resolves the downstream "Cannot find name" errors in the same file.

### C3. Undefined component/type names — missing imports or defs (~11 errors)
- `blocks/lp-navbar/LPNavbar01..07.svelte` — `Cannot find name 'Link'` (7). Define/import the `Link` component (or replace with `<a>`).
- `blocks/navbar/Navbar01.svelte:35` — `Cannot find name 'NavItem'`.
- `blocks/sidebar/SidebarLayout04.svelte:31` — `Cannot find name 'TreeItem'`.
- `blocks/sidebar/SidebarLayout11.svelte:23` — `Cannot find name 'FileNode'` (likely a missing `type`/`interface`).
**Fix:** add the missing import, component stub, or type definition each block references.

### C4. Structural / template (3 errors)
- `blocks/gallery-section/GallerySection11.svelte:23` — `<section> was left open` → this compile failure also causes `blocks/gallery-section/index.ts:11` `has no exported member 'default'`. Fix the unclosed tag; both errors clear.
- `blocks/empty-section/EmptySection04.svelte:66` — `<button>` nested in `<button>`. Restructure (make the inner one a non-button, or move it out).
- `blocks/checkout/Checkout02.svelte:49` — `'key' does not exist in type HTMLProps<div…>`. Remove the stray `key={…}` attribute (not a Svelte 5 keyed-each key).

### C5. Type mismatches & implicit any (~7 errors)
- `blocks/playground/PlaygroundBlock01.svelte:139`, `PlaygroundBlock02.svelte:133` — `Type 'number' is not assignable to type 'string'` (coerce with `String(...)` or fix the target type).
- `blocks/team-section/TeamSection03.svelte:63`, `TeamSection04.svelte:64` — `Parameter 'n' implicitly has an 'any' type` (annotate the callback param).
- `blocks/checkout/Checkout01.svelte:28,34` — `Untyped function calls may not accept type arguments` + `Parameter 'sum'/'item' implicitly any` (type the reduce/map params; may clear once C1 is fixed).
- `blocks/calendar/CalendarBlock04.svelte:53` — `'s' is possibly 'null'` (guard/optional-chain).

### C6. Templates helper (1 error, not under blocks/)
- `src/lib/templates/ContentLayout.svelte:97` — `Type 'string | undefined' is not assignable to type 'string'`. Provide a fallback (`?? ''`) or widen the prop type.

---

## Suggested execution order
1. **Group A** (2 files) and **Group B** (1 new file) — quick, real bugs, do regardless of A/B decision.
2. Confirm the **prune-vs-fix** decision for `blocks/` with the owner.
3. If fixing: **C2 → C1 → C3 → C4 → C5 → C6** (C2/C1 clear the most errors per edit and remove cascades).
4. After each group: `npm run check`. At 0 errors: `npx vite build` + `npx vitest run` must pass.

## Notes
- Warnings (428) are mostly Svelte-5 advisories (`<svelte:component>` deprecation, `state_referenced_locally`, a11y) across `advanced/*` and `blocks/*`. Out of scope for "0 errors"; tackle separately if desired.
- Don't reintroduce the Group-A `@xbg.solutions/bpsk-core` `AUTH_ROUTES` import — always use `$lib/constants/auth.constants`.
- Full raw error list: re-run `npm run check`; do not trust a stale copy after edits.
