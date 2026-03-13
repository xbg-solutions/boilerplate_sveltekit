# Skills Directory — Master Index

This is the root index for all Claude Code skills available in this project. Use it to find the right skill for your task.

---

## Project-Specific Skills (XBG Boilerplate)

These skills document the internal architecture, patterns, and conventions of this SvelteKit boilerplate.

| Skill | Directory | Use When... |
|---|---|---|
| `xbg_bpsk_overview` | `xbg_bpsk_overview/` | Orienting yourself in the project, understanding architecture, finding the right sub-skill |
| `xbg_bpsk_setup` | `xbg_bpsk_setup/` | Bootstrapping a new project, running CLI setup, mono-repo configuration, deployment |
| `xbg_bpsk_packages` | `xbg_bpsk_packages/` | npm distribution (`@xbg/*` packages), dependency graph, import path mapping (`$lib/` → `@xbg/*`), installing utilities, scaffolded vs packaged, test suite structure |
| `xbg_bpsk_config` | `xbg_bpsk_config/` | Working with `app.config.ts`, env vars, roles/RBAC, feature flags |
| `xbg_bpsk_stores` | `xbg_bpsk_stores/` | Using or extending Svelte stores (`authStore`, `loadingStore`, `toastStore`, etc.) |
| `xbg_bpsk_services` | `xbg_bpsk_services/` | Calling services (`authService`, `apiService`, `toastService`, `initializationService`, etc.) |
| `xbg_bpsk_utils` | `xbg_bpsk_utils/` | Using utility functions (`cn`, `routeHandler`, `authGuard`, `rbacUtil`, `errorHandler`, etc.) |

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

1. **Project-specific first** — Check `xbg_bpsk_*` skills for boilerplate conventions and patterns. These override external guidance when there's a conflict.
2. **Library skills second** — Check `firebase`, `shadcn_svelte`, or `svelte5_sveltekit` for technology-specific guidance.
3. **External sources last** — If a skill references external repos with priority ordering, consult sources in the listed priority order.

### Topic → Skill Mapping

| Topic | Primary Skill | Also Check |
|---|---|---|
| Project architecture / orientation | `xbg_bpsk_overview` | — |
| New project setup / CLI | `xbg_bpsk_setup` | `xbg_bpsk_packages` (for utility selection) |
| npm packages / `@xbg/*` imports | `xbg_bpsk_packages` | `xbg_bpsk_setup` (for CLI install flow) |
| Dependency graph / package boundaries | `xbg_bpsk_packages` | — |
| Import path mapping (`$lib/` → `@xbg/*`) | `xbg_bpsk_packages` | — |
| Installing a new utility | `xbg_bpsk_packages` | `xbg_bpsk_setup` (for CLI sync) |
| Test suite / test utils / mocks | `xbg_bpsk_packages` | — |
| Scaffolded vs packaged code | `xbg_bpsk_packages` | — |
| `app.config.ts` / env vars / RBAC | `xbg_bpsk_config` | — |
| Svelte stores | `xbg_bpsk_stores` | `svelte5_sveltekit` (for runes patterns) |
| Services (auth, API, toast, etc.) | `xbg_bpsk_services` | `firebase` (for Firebase Auth details) |
| Utilities (cn, guards, errors) | `xbg_bpsk_utils` | — |
| Firebase Auth / Firestore / Functions | `firebase` | `xbg_bpsk_services` (for boilerplate wrappers) |
| Firebase deployment / emulators | `firebase` | `xbg_bpsk_setup` (for project-specific deploy) |
| UI components / shadcn | `shadcn_svelte` | `xbg_bpsk_overview` (for barrel import convention) |
| Svelte 5 runes / reactivity | `svelte5_sveltekit` | `xbg_bpsk_stores` (for store patterns) |
| SvelteKit routing / load functions | `svelte5_sveltekit` | `xbg_bpsk_utils` (for route guards) |
| Tailwind CSS / styling | `svelte5_sveltekit` | `shadcn_svelte` (for theming) |
| Forms / form actions | `svelte5_sveltekit` | `shadcn_svelte` (for form components) |
