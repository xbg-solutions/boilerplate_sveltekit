# XBG Boilerplate Frontend — Platform Agent Context

> Injected as `context.boilerplate-frontend` during Solutioning, Design, and Frontend Tickets phases. This document is for non-developer agents reasoning about what the frontend build agent can produce, not for executing builds.

---

## 1. What This Boilerplate Is

The XBG frontend boilerplate is a production-ready SvelteKit 2 foundation using Svelte 5 (runes syntax), Tailwind CSS, and Firebase Auth. It is distributed as a set of npm packages (`@xbg.solutions/bpsk-core` plus individually installable utility packages) combined with a CLI tool (`npx @xbg.solutions/bpsk`) that scaffolds project files and copies UI components from a registry. Runtime utilities update via npm semver; UI components are copy-on-install and owned by the project.

The architecture is opinionated toward agentic, AI-assisted development. Constraints are intentional: a single configuration file, singleton services, a fixed component model, and strict Svelte 5 syntax. These constraints enable the build agent to produce correct output in a single pass. Solutions and design decisions that work within these constraints will translate cleanly to build tickets; those that work against them carry implementation risk.

---

## 2. Three-Tier Component Model

All frontend UI is built from three tiers. This hierarchy is load-bearing for design and ticket writing.

**Tier 1 — Basic atoms (included in every project).** Button, Card, Input, Label, Badge, Checkbox, RadioGroup, Tabs, Table, DropdownMenu, Breadcrumb, Alert, Progress, Textarea, Popover, Pagination, Avatar, Separator, Skeleton. These exist in every scaffolded project and are used directly.

**Tier 2 — Extended atoms (registry, copy-on-install).** OtpInput, Calendar, Select, Dialog, StatisticCard, UserItem, SidebarItem, DataTable, FormWizard, ChartWrapper, ImageUpload, and others. Installed via the CLI from the bpsk registry. More complex than basic atoms; typically 50-650 lines with keyboard navigation, focus management, or multi-step logic.

**Tier 3 — Blocks (registry, copy-on-install).** 450+ pre-built page-level compositions across 55 categories: auth, dashboard, sidebar, hero-section, pricing-section, testimonials, calendar, navbar, footer, forms, tasks, e-commerce (cart, checkout, product cards/listings/detail), bento-grid, gallery, blog, stats, CTA, FAQ, team, contact, comparisons, and more. Each category has numbered layout variants (e.g., LoginBlock01 through LoginBlock05). Blocks compose atomic components and accept data via props and callbacks.

**Design implication:** Prefer registry-available components and blocks when specifying UI. A design that maps to existing blocks or atoms can be implemented quickly and reliably. Custom components (not in the registry) are feasible but represent additional implementation effort. Tickets should explicitly flag when a design requires custom components vs registry components, as this affects sizing.

---

## 3. Svelte 5 Runes — Design Constraints

The boilerplate enforces Svelte 5 runes syntax. These constraints affect how the UX agent specifies component behavior and how stories describe interactions:

- **Props use `$props()`, not `export let`.** Component interfaces are defined through destructured props with TypeScript types.
- **Reactive state uses `$state()` and `$derived()`.** There is no `$:` reactive assignment syntax.
- **Side effects use `$effect()`.** There is no `onMount`/`onDestroy` for reactive lifecycle.
- **Content projection uses `{@render children()}`, not `<slot />`.** Named slots do not exist in this syntax.
- **Event handling uses callback props (e.g., `onSubmit`, `onChange`), not `createEventDispatcher`.** Specs should describe callbacks, not dispatched events.
- **Overlay state (Dialog, Sheet, Popover) must not use `bind:open` with derived or conditional expressions.** Open state must be a flat `$state` boolean with an `onOpenChange` callback. Designs involving multiple overlays per page should note this constraint.

Do not spec patterns that rely on Svelte 4 syntax. The build agent will reject them.

---

## 4. Single Configuration Source — `app.config.ts`

All roles, role hierarchy, permissions, feature flags, route definitions, and project identity flow through one file: `app.config.ts`. Secrets and IDs come from `.env` via environment variables; structural config (RBAC, features) lives in marked blocks within the file.

**Solutioning implication:** Role and permission decisions made during Solutioning (documented in rbac.md) feed directly into this file at setup time. Stories that introduce new roles, permissions, or feature flags must reference `app.config.ts` as the target. There is no separate permissions database or admin UI for RBAC configuration on the frontend.

---

## 5. Service and Store Singletons

The boilerplate provides pre-built singleton services and stores. These are imported and used directly — never instantiated or duplicated.

**Available services:** `authService` (Firebase Auth wrapper), `apiService` (typed HTTP client with CSRF, retry, auth headers), `toastService` (toast notifications), `initializationService` (app startup), `loggerService` (structured logging), `tabSyncService` (cross-tab coordination), `cacheService`/`apiCacheService` (response caching), event bus (`publish`/`subscribe`).

**Available stores:** `authStore`, `loadingStore`, `toastStore`, `initializationStore`, `rbacStore`.

**Ticket writing implication:** Stories should reference these services and stores by name (e.g., "use `apiService` to fetch data", "show feedback via `toastService`") rather than describing equivalent functionality to be built from scratch. If a story describes "implement a loading state manager" or "create an HTTP client", it is duplicating existing capability.

---

## 6. SSR Safety

SvelteKit renders on the server by default. Any code that accesses `window`, `localStorage`, `document`, or other browser-only APIs must be wrapped in a `browser` guard. Stories involving client-only behavior (local storage persistence, DOM measurements, clipboard access) should note the SSR constraint so the build agent applies the guard.

---

## 7. Auth Flows — Critical Constraint

Authentication flows (OTP send, OTP verify, token refresh, logout) go through the backend API via `apiService` and are orchestrated by `authService`. They do **not** call the Firebase Auth client SDK directly for these operations. `authService` handles token processing, store updates, and event publishing internally.

This is a common spec error. If a story or design describes "call Firebase `signInWithEmailLink()` directly" or "use the Firebase SDK to send OTP", it will produce a build failure. Auth interactions must be specified as `authService` method calls routed through the backend. The frontend does not independently manage auth state outside of `authService`.

---

## 8. Setup Wizard Outputs

The CLI setup wizard (`npx @xbg.solutions/bpsk setup --config setup-config.json`) requires a `setup-config.json` file and produces:

- **`.env` + `.env.example`** — Firebase credentials, API URLs, app identity, analytics IDs
- **`app.config.ts`** (SETUP-marked blocks) — Roles, role hierarchy, permissions, claim map, feature flags
- **`firebase.json` + `.firebaserc`** — Firebase hosting and project binding

**Required inputs in `setup-config.json`:** App identity (name, shortName, domain, supportEmail), all Firebase credentials (projectId, apiKey, authDomain, storageBucket, messagingSenderId, appId), API base URLs (dev + prod), RBAC configuration (default or custom roles), and feature flag selections.

**Phase handoff implication:** Solutions and BA must ensure that the Solutioning phase captures all inputs the setup wizard requires — particularly Firebase project details, RBAC role definitions, and feature flag decisions — so the Frontend Build phase has what it needs at kickoff.

---

## 9. On-Boilerplate vs Off-Boilerplate

**Natively covered (on-boilerplate):**
- Auth pages using registry blocks (login, signup, OTP verification) with `authService` orchestration
- Role-gated dashboards composed from dashboard blocks, sidebar blocks, and statistic cards with RBAC checking via `rbacUtil`
- CRUD views using `apiService` for data fetching, `DataTable` for listing, `FormWizard` for multi-step forms, `toastService` for feedback

**Requires custom scaffolding (off-boilerplate):**
- Real-time collaborative editing (WebSocket/CRDT) — the boilerplate has SSE utilities but no collaborative state engine
- Complex drag-and-drop interfaces (Kanban boards, visual builders) — no drag-and-drop primitives in the registry
- Third-party OAuth providers beyond Firebase Auth's built-in support — requires custom integration outside `authService`

When the Solutions agent encounters a requirement that appears off-boilerplate, it should flag the additional frontend complexity and ensure the ticket includes explicit scaffolding scope.

---

## What This Context Does NOT Cover

This document provides reasoning context for non-developer agents. The build agent in a Frontend Build session has access to detailed implementation skills that are not replicated here:

- **bpsk/setup** — Full setup wizard workflow, mono-repo configuration, deployment procedures
- **bpsk/components** — Complete block inventory with variant counts, installation commands, component creation templates
- **bpsk/config** — Detailed `APP_CONFIG` structure, computed config, all configuration helpers
- **bpsk/services** — Full service APIs, method signatures, request options, retry behavior
- **bpsk/stores** — Store state shapes, subscription patterns, helper methods
- **bpsk/utils** — Route handler API, RBAC utility methods, error hierarchy, sanitization
- **bpsk/security_hardening** — CSP, Firebase security rules, App Check, CSRF, deployment checklist
- **bpsk/packages** — npm distribution model, dependency graph, import path mapping
- **bpsk/contributing** — Registry maintenance, manifest generation, component classification

Non-developer agents should not attempt to specify implementation details covered by these skills. Design to the constraints described above; the build agent will resolve implementation specifics.
