# Skills Directory — Master Index

Root index for all Claude Code skills in this project.

---

## Project-Specific Skills

| Skill | Directory | Use When... |
|---|---|---|
| `bpsk` | `bpsk/` | Working with this SvelteKit boilerplate — architecture, setup, config, stores, services, utilities, components, packages, security |

---

## Library & Framework Skills

### Firebase

| Skill | Directory | Use When... |
|---|---|---|
| `firebase` | `firebase/` | Firebase services, Firestore queries/rules, Cloud Functions, Auth providers, emulators, deployment |

### UI Components (shadcn-svelte)

| Skill | Directory | Use When... |
|---|---|---|
| `shadcn_svelte` | `shadcn_svelte/` | Adding/using shadcn-svelte components, forms, dark mode, data tables, theming |

### Frontend Design (Impeccable)

| Skill | Directory | Use When... |
|---|---|---|
| `impeccable` | `impeccable/` | Designing/refining UI/UX, typography/color/layout decisions, design anti-patterns |

### Svelte 5 & SvelteKit

| Skill | Directory | Use When... |
|---|---|---|
| `svelte5_sveltekit` | `svelte5_sveltekit/` | Svelte 5 runes, SvelteKit routing/data flow, Tailwind integration, SSR patterns |

---

## Skill Resolution Order

1. **Project-specific first** — `bpsk` for boilerplate conventions. These override external guidance.
2. **Library skills second** — `firebase`, `shadcn_svelte`, `svelte5_sveltekit`, `impeccable` for technology-specific guidance.

### Topic → Skill Map

| Topic | Primary Skill | Also Check |
|---|---|---|
| Project architecture / orientation | `bpsk` | — |
| Setup / CLI / config | `bpsk` | — |
| npm packages / `@xbg.solutions/*` | `bpsk` | — |
| Import paths / dependency graph | `bpsk` | — |
| Test suite / mocks / test utils | `bpsk` | — |
| Stores (auth, loading, toast) | `bpsk` | `svelte5_sveltekit` (runes) |
| Services (auth, API, toast) | `bpsk` | `firebase` (Firebase Auth) |
| Utilities (cn, guards, errors) | `bpsk` | — |
| UI components / blocks | `bpsk` | `shadcn_svelte`, `impeccable` |
| Security (CSP, CSRF, App Check) | `bpsk` | `firebase` |
| Firebase Auth / Firestore / Functions | `firebase` | `bpsk` (wrappers) |
| shadcn components | `shadcn_svelte` | `bpsk` (import conventions) |
| Svelte 5 runes / reactivity | `svelte5_sveltekit` | `bpsk` (store patterns) |
| SvelteKit routing / load functions | `svelte5_sveltekit` | `bpsk` (route guards) |
| Tailwind CSS / styling | `svelte5_sveltekit` | `shadcn_svelte` (theming) |
| Design / UI refinement | `impeccable` | `shadcn_svelte` |
