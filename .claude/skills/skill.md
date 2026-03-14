# Skills Directory — Master Index

This is the root index for all Claude Code skills available in this project. Use it to find the right skill for your task.

---

## Project-Specific Skills (XBG Boilerplate)

These skills document the internal architecture, patterns, and conventions of this SvelteKit boilerplate.

| Skill | Directory | Use When... |
|---|---|---|
| `xbg_boilerplate_sveltekit` | `xbg_boilerplate_sveltekit/` | Working with this SvelteKit boilerplate — architecture, setup, config, stores, services, utilities, components, packages, security. See the skill's sub-topics for detailed guidance. |

---

## Library & Framework Skills (External Sources)

These skills synthesize guidance from community and official skill repositories for the key technologies used in this project.

### Firebase

| Skill | Directory | Use When... |
|---|---|---|
| `firebase` | `firebase/` | Setting up Firebase services, writing Firestore queries/rules, Cloud Functions, Auth providers, emulators, deployment, AI Logic/Genkit |

**Priority sources:**
1. [firebase/agent-skills](https://github.com/firebase/agent-skills) (official) — Auth, Firestore, Hosting, App Hosting, Data Connect, AI Logic, Genkit, local env setup
2. [SpillwaveSolutions/using-firebase](https://github.com/SpillwaveSolutions/using-firebase) — Cloud Functions (both gens), emulators, deployment scripts, security rules, GCP integration

### UI Components (shadcn-svelte)

| Skill | Directory | Use When... |
|---|---|---|
| `shadcn_svelte` | `shadcn_svelte/` | Adding/using shadcn-svelte components, forms (Superforms + Formsnap), dark mode, data tables, theming, custom registries |

**Source:** [antstanley/shadcn-svelte-skill](https://github.com/antstanley/shadcn-svelte-skill) — 59 component docs, installation, theming, Tailwind v4 migration

### Frontend Design (Impeccable)

| Skill | Directory | Use When... |
|---|---|---|
| `impeccable` | `impeccable/` | Designing/refining UI/UX, making typography/color/layout decisions, avoiding design anti-patterns, creating visually cohesive interfaces |

**Source:** [pbakaus/impeccable](https://github.com/pbakaus/impeccable) — Design language with curated patterns and anti-patterns for impeccable frontend design (17 commands, typography, color, layout, motion guidance)

### Svelte 5 & SvelteKit

| Skill | Directory | Use When... |
|---|---|---|
| `svelte5_sveltekit` | `svelte5_sveltekit/` | Svelte 5 runes, SvelteKit routing/data flow, Tailwind v4 integration, SSR patterns, form actions, migration |

**Priority sources:**
1. [claude-skills/sveltekit-svelte5-tailwind-skill](https://github.com/claude-skills/sveltekit-svelte5-tailwind-skill) — SvelteKit 2 + Svelte 5 + Tailwind v4 integration (24 guides)
2. [splinesreticulating/claude-svelte5-skill](https://github.com/splinesreticulating/claude-svelte5-skill) — Svelte 5 runes, SvelteKit routing, component patterns
3. [spences10/svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) — Runes, data flow, structure (archived; maintained at [svelte-skills-kit](https://github.com/spences10/svelte-skills-kit))

---

## Skill Resolution Guide

When working on a task, consult skills in this order:

1. **Project-specific first** — Check `xbg_boilerplate_sveltekit` skill for boilerplate conventions and patterns. These override external guidance when there's a conflict.
2. **Library skills second** — Check `firebase`, `shadcn_svelte`, or `svelte5_sveltekit` for technology-specific guidance.
3. **External sources last** — If a skill references external repos with priority ordering, consult sources in the listed priority order.

### Topic → Skill Mapping

| Topic | Primary Skill | Also Check |
|---|---|---|
| Project architecture / orientation | `xbg_boilerplate_sveltekit` | — |
| New project setup / CLI | `xbg_boilerplate_sveltekit` | — |
| npm packages / `@xbg/*` imports | `xbg_boilerplate_sveltekit` | — |
| Dependency graph / package boundaries | `xbg_boilerplate_sveltekit` | — |
| Import path mapping (`$lib/` → `@xbg/*`) | `xbg_boilerplate_sveltekit` | — |
| Installing a new utility | `xbg_boilerplate_sveltekit` | — |
| Test suite / test utils / mocks | `xbg_boilerplate_sveltekit` | — |
| Scaffolded vs packaged code | `xbg_boilerplate_sveltekit` | — |
| `app.config.ts` / env vars / RBAC | `xbg_boilerplate_sveltekit` | — |
| Svelte stores | `xbg_boilerplate_sveltekit` | `svelte5_sveltekit` (for runes patterns) |
| Services (auth, API, toast, etc.) | `xbg_boilerplate_sveltekit` | `firebase` (for Firebase Auth details) |
| Utilities (cn, guards, errors) | `xbg_boilerplate_sveltekit` | — |
| UI components / blocks | `xbg_boilerplate_sveltekit` | `shadcn_svelte` (for component docs), `impeccable` (for design guidance) |
| Security (CSP, CSRF, App Check, rules) | `xbg_boilerplate_sveltekit` | `firebase` (for Firebase-specific security) |
| Firebase Auth / Firestore / Functions | `firebase` | `xbg_boilerplate_sveltekit` (for boilerplate wrappers) |
| Firebase deployment / emulators | `firebase` | `xbg_boilerplate_sveltekit` (for project-specific deploy) |
| UI components / shadcn | `shadcn_svelte` | `xbg_boilerplate_sveltekit` (for barrel import convention), `impeccable` (for design patterns) |
| Svelte 5 runes / reactivity | `svelte5_sveltekit` | `xbg_boilerplate_sveltekit` (for store patterns) |
| SvelteKit routing / load functions | `svelte5_sveltekit` | `xbg_boilerplate_sveltekit` (for route guards) |
| Tailwind CSS / styling | `svelte5_sveltekit` | `shadcn_svelte` (for theming), `impeccable` (for color/typography) |
| Forms / form actions | `svelte5_sveltekit` | `shadcn_svelte` (for form components) |
| Design / UI refinement | `impeccable` | `shadcn_svelte` (for component implementation) |
