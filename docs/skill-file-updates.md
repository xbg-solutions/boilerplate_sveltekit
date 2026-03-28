# Updated Sections for External Skill Files

These are the sections that need to change in the two external skill files
(SKILL-frontend-developer.md and SKILL-frontend-build.md) that are injected
as system context for the Frontend Developer agent.

---

## 1. SKILL-frontend-developer.md — "Boilerplate Setup and Skill Libraries" section

Replace the entire "### Setting Up the Boilerplate" subsection with:

---

### Setting Up the Boilerplate

Before any code is written, the project must be configured using the setup wizard in non-interactive mode. The platform provides a `setup-config.json` file as a phase input — this contains the project's Firebase credentials, domain configuration, API URLs, RBAC roles, and feature flags.

```bash
git clone <repo-url> [project-name]
cd [project-name]
npm install
node __scripts__/setup.cjs --config setup-config.json
npm run build
```

The setup wizard reads the config file, validates all required fields, and writes:
- `.env` — all `VITE_*` environment variables
- `.env.example` — sanitised copy for team sharing
- `src/lib/config/app.config.ts` — RBAC roles/hierarchy/permissions and feature flags (in `SETUP:start/end` marker blocks)
- `firebase.json` — hosting target and region
- `.firebaserc` — project ID and target aliases

After the wizard completes:
- Verify all required environment variables are populated in `.env` against `constraints.md`
- Run `npm run build` — must pass clean before any project code is added

If the build does not pass clean on a freshly configured project, raise a `blocking` issue before proceeding. Do not build on a broken foundation.

If `setup-config.json` is not provided as a phase input, raise a `blocking` issue immediately. The project cannot be configured without it.

---

Also replace this subsection that follows it:

### Skill Libraries

After configuration, locate the entry point:

(keep the rest of the Skill Libraries section as-is — only the first paragraph needs "After scaffolding" changed to "After configuration")

---

## 2. SKILL-frontend-developer.md — "Area of Concern" section

No changes needed. The area of concern is still correct.

---

## 3. SKILL-frontend-developer.md — "Svelte Syntax Convention" (NEW — add after "Your Relationship to the Postman Collection")

Add a new section:

---

## Your Relationship to the Boilerplate's Code Conventions

The boilerplate uses **Svelte 4 component syntax** running on Svelte 5. All 40+ existing components follow:
- `export let` for props
- `$$restProps` for attribute forwarding
- `<slot />` for content projection
- `on:click` for event forwarding
- `$:` for reactive declarations
- `tailwind-variants` (`tv()`) for variant definitions
- `cn()` from `$lib/utils/cn` for class merging

Follow these patterns in all components you build. The `svelte5_sveltekit` skill in the boilerplate's skill library documents Svelte 5 runes (`$props()`, `$state()`, `$effect()`) — these describe the runtime capabilities, not the coding convention for this project. Do not introduce runes-based syntax into components that follow the Svelte 4 pattern.

If a design spec preview uses runes syntax, transcribe the component using the existing Svelte 4 patterns to maintain consistency across the codebase.

---

## 4. SKILL-frontend-build.md — "Phase inputs" line in the header

Change:

> **Phase inputs:** All Design Phase deliverables (`design/` folder in repo), `postman-collection.json` (from Backend Build), `acceptance-criteria.md` (from Solutioning)

To:

> **Phase inputs:** All Design Phase deliverables (`design/` folder in repo), `postman-collection.json` (from Backend Build), `acceptance-criteria.md` (from Solutioning), `setup-config.json` (from platform — Firebase credentials, domain, RBAC, feature flags)

---

## 5. SKILL-frontend-build.md — Session Start Checklist

Replace the checklist with:

---

## Session Start Checklist

Before writing any code:

- [ ] Clone `boilerplate_sveltekit`, run `npm install`
- [ ] Verify `setup-config.json` is provided as a phase input — if missing, raise a `blocking` issue immediately
- [ ] Run `node __scripts__/setup.cjs --config setup-config.json` — confirm `.env`, `app.config.ts`, `firebase.json`, `.firebaserc` are written
- [ ] Run `npm run build` — confirm baseline is clean
- [ ] Verify all six skill files are present in `.claude/skills/` — if any are missing, raise a `blocking` issue before proceeding
- [ ] Read `SKILL_boilerplate_sveltekit.md` in full — note the Svelte syntax convention (Svelte 4 patterns on Svelte 5)
- [ ] Call `get_project_context` — confirm Design phase and Solutioning deliverable packages are loaded
- [ ] Call `get_phase_state` — confirm which segments are complete, which are pending
- [ ] Check design spec entity statuses — surface any `stale` or `draft` entities before proceeding; do not build against them without explicit acknowledgment
- [ ] Read `acceptance-criteria.md` in full — identify all frontend-dimension conditions before writing any code
- [ ] Confirm `postman-collection.json` is available and loaded — Phase 5 cannot proceed without it

If any of these steps reveals a problem — missing deliverable, missing skill files, missing `setup-config.json`, stale design entities, missing Postman collection, failed baseline build — raise it before proceeding. Do not build on an uncertain foundation.

---

## 6. SKILL-frontend-build.md — Segment 2.1 Steps

In Segment 2.1, replace step 1:

Change:
> 1. Read `SKILL_boilerplate_sveltekit.md` in full before starting

To:
> 1. Read `SKILL_boilerplate_sveltekit.md` in full before starting — note the Svelte syntax convention (Svelte 4 component patterns running on Svelte 5; do not use runes)

---

## 7. SKILL-frontend-build.md — Phase Complete Criteria

No changes needed. The existing criteria are still correct.

---

## 8. SKILL-frontend-build.md — Principles section (add one principle)

Add to "Principles to Apply at All Times":

**Follow the boilerplate's code conventions.** The boilerplate uses Svelte 4 component syntax (`export let`, `$$restProps`, `<slot />`, `on:click`, `$:`) running on Svelte 5. All components, whether transcribed from design spec or generated, must follow this pattern. Do not introduce Svelte 5 runes into the codebase.
