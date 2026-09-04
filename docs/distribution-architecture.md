# XBG Frontend Boilerplate — Distribution Architecture

## Problem

Boilerplate repos are forked/cloned to start new projects. When the boilerplate is updated, there's no way to propagate changes to existing projects.

## Solution: Two-part distribution model

### Part 1: npm packages (runtime dependencies)

The boilerplate is split into installable packages that live in `node_modules/` and are imported by project code. Updates propagate via standard `npm update` **within a major**. A caret range (`^2.0.0`) also guarantees a project never receives anything published after the next major, so every major needs an explicit bump in every consumer — see `UPGRADING.md`. Since 2.1.0 the utils declare `bpsk-core` as a peer dependency, so a project always has exactly one copy of core (it holds module-level Firebase, toast and logger state).

### Part 2: CLI tool with component registry (project structure + UI)

A CLI tool (`npx @xbg.solutions/bpsk`) handles everything that isn't a runtime import — project configuration, component installation, code generation, and validation.

```bash
# Configure project
npx @xbg.solutions/bpsk setup --config setup-config.json

# Add components from registry (copy-on-install, shadcn philosophy)
npx @xbg.solutions/bpsk add block-auth block-dashboard otp-input

# Generate scaffolds
npx @xbg.solutions/bpsk generate component UserProfile
npx @xbg.solutions/bpsk generate route dashboard --auth
npx @xbg.solutions/bpsk generate service AnalyticsService

# Validate
npx @xbg.solutions/bpsk validate
```

---

## Package Map

### @xbg.solutions/bpsk-core (always required)

The base framework package every project depends on.

**Contains:**
- Config schema and helpers (`defineConfig()` types, validation)
- Core TypeScript types/interfaces (`api.types.ts`, `error.types.ts`, `auth.types.ts`, etc.)
- Core stores (`loading.store.ts`, `toast.store.ts`, `initialization.store.ts`, `logging.store.ts`)
- Error handler (base error normalization — `AppError`, `ApiError`, `AuthError`)
- Logging service and store (contextual logging with levels — always needed)
- Route handler utilities (`route-handler.ts`, `route-handler.store.ts`)
- Core services (`initialization.service.ts`, `toast.service.ts`)
- Base layout components (`ErrorBoundary`, `PageTransition`, `ClientOnly`)
- `cn()` utility (Tailwind class merging via `clsx` + `tailwind-merge`)
- Event bus + pub/sub system (`eventBus`, `publish`, `subscribe`)
- Mutex service for mutual exclusion

**No optional dependencies.** This is the foundation everything else builds on.

### @xbg.solutions/bpsk-test-utils (dev dependency)

Test utilities installed as a devDependency. Kept separate from core to avoid shipping test code and test framework dependencies (`vitest`, `@testing-library/svelte`) to production.

### @xbg.solutions/bpsk-utils-* (individually installable)

Each utility is its own package. Projects install only what they need.

| Package | Description | Depends on |
|---|---|---|
| `@xbg.solutions/bpsk-utils-firebase-auth` | Auth service, token service, auth/token stores, auth guard, signout | `core`, `utils-csrf`, `utils-secure-storage`, `firebase` |
| `@xbg.solutions/bpsk-utils-api-client` | API service, request/response handlers, response caching | `core`, `utils-csrf` |
| `@xbg.solutions/bpsk-utils-secure-storage` | Encrypted client-side storage with key derivation | `core` |
| `@xbg.solutions/bpsk-utils-csrf` | CSRF token generation/validation, store, constants | `core` |
| `@xbg.solutions/bpsk-utils-sanitizer` | Input sanitization, XSS prevention | `core` |
| `@xbg.solutions/bpsk-utils-rbac` | Role hierarchy, permission checking, store | `core` |
| `@xbg.solutions/bpsk-utils-tab-sync` | Cross-tab synchronization via BroadcastChannel/storage events | `core`, `utils-firebase-auth` |
| `@xbg.solutions/bpsk-utils-recaptcha` | reCAPTCHA v3 integration | `core` |
| `@xbg.solutions/bpsk-utils-seo` | Meta tags, structured data, OpenGraph | `core` |
| `@xbg.solutions/bpsk-utils-sse` | Server-sent events client | `core` |
| `@xbg.solutions/bpsk-utils-performance` | Performance metrics, monitoring | `core` |
| `@xbg.solutions/bpsk-utils-file-upload` | File handling with Firebase Storage | `core`, `utils-firebase-auth`, `utils-api-client` |
| `@xbg.solutions/bpsk-utils-state-manager` | Global state persistence | `core`, `utils-secure-storage` |

> **Note:** `utils-event-bus` and `utils-mutex` were merged into `frontend-core` to avoid circular dependencies.

**Dependency auto-resolution:** Installing `@xbg.solutions/bpsk-utils-firebase-auth` automatically installs its dependencies (`utils-csrf`, `utils-secure-storage`, etc.).

### @xbg.solutions/bpsk (CLI tool, not a runtime dependency)

The CLI tool with component registry. Not installed as a project dependency — invoked via `npx @xbg.solutions/bpsk`.

**Commands:**

| Command | What it does |
|---|---|
| `setup` | Interactive wizard or `--config setup-config.json` for non-interactive |
| `add <names>` | Copy components from registry into project (`--yes` for agents, `--force` to overwrite) |
| `add list` | List all available registry components |
| `validate` | Check project structure, deps, env vars, config |
| `generate component <Name>` | Generate Svelte component with optional test/story/docs |
| `generate route <path>` | Generate route with auth guards, load functions, role checks |
| `generate service <Name>` | Generate service with CRUD, error handling, events |

**Component registry** contains:
- **Extended atoms** (16): OtpInput, Calendar, Select, Dialog, StatisticCard, UserItem, NotificationBadge, SidebarItem, NavItem, MenuItem, Message, Legend, SettingsCard, TextEditor, Uploader, Icon
- **Advanced components** (4): ChartWrapper, DataTable, FormWizard, ImageUpload
- **Blocks** (450+ across 55 categories): auth, dashboard, sidebar, hero-section, pricing-section, testimonials, team-section, and more

---

## Three-Tier Component Model

### Tier 1: Basic Atoms (agent-coded)

Simple shadcn-style components: Button, Card, Input, Label, Badge, Checkbox, RadioGroup, Sheet, Tabs, Table, DropdownMenu, Breadcrumb, Alert, Progress, Textarea, Popover, Pagination, Avatar, Separator, Skeleton.

Agents code these directly following the Svelte 5 runes + `tv()` + `cn()` pattern. They're too simple to warrant registry overhead and too commonly customized to lock down.

### Tier 2: Extended Atoms (from registry)

Complex components with significant logic: OtpInput (108 lines, auto-focus/paste), Calendar (181 lines, date grid), DataTable (644 lines, sort/filter/paginate), etc.

```bash
npx @xbg.solutions/bpsk add otp-input calendar data-table
```

Copied into `src/lib/components/ui/<name>/`. Project owns the source.

### Tier 3: Blocks (from registry)

Full page compositions across 55 categories. Each category has multiple layout variants.

```bash
npx @xbg.solutions/bpsk add block-auth block-dashboard block-hero-section
```

Copied into `src/lib/components/blocks/<category>/`. Project owns the source.

### Why copy-on-install?

Components are **copied, not imported from npm**. This means:
- Updates to the boilerplate don't break existing projects
- Projects can freely customize any component
- No runtime dependency on the component package
- Follows the proven shadcn model

Runtime packages (`@xbg.solutions/bpsk-core`, `utils-*`) ARE imported from npm and DO receive updates via `npm update`.

---

## Dependency Graph

```
@xbg.solutions/bpsk (CLI, invoked via npx)
    │
    ├── setup: configures .env, app.config.ts, Firebase
    ├── add: copies components from registry → src/lib/components/
    └── generate: scaffolds components, routes, services

@xbg.solutions/bpsk-core ◄─────────────────────────────┐
    ▲  (includes event-bus, mutex, logging, errors, cn)     │
    │                                                       │
    ├── @xbg.solutions/bpsk-utils-csrf ◄──────────────┐          │
    ├── @xbg.solutions/bpsk-utils-secure-storage      │          │
    ├── @xbg.solutions/bpsk-utils-firebase-auth ──────┤ (auto)   │
    │       └── depends on csrf,                 │          │
    │          secure-storage, rbac              │          │
    ├── @xbg.solutions/bpsk-utils-api-client ─────────┘          │
    │       └── depends on csrf                             │
    ├── @xbg.solutions/bpsk-utils-tab-sync                       │
    │       └── depends on firebase-auth                    │
    ├── @xbg.solutions/bpsk-utils-rbac                           │
    ├── @xbg.solutions/bpsk-utils-sanitizer                      │
    ├── @xbg.solutions/bpsk-utils-recaptcha                      │
    ├── @xbg.solutions/bpsk-utils-seo                            │
    ├── @xbg.solutions/bpsk-utils-sse                            │
    ├── @xbg.solutions/bpsk-utils-performance                    │
    ├── @xbg.solutions/bpsk-utils-file-upload                    │
    │       └── depends on firebase-auth, api-client        │
    └── @xbg.solutions/bpsk-utils-state-manager                  │
            └── depends on secure-storage                   │
                                                            │
@xbg.solutions/bpsk-test-utils (devDependency) ────────┘
```

---

## What changes in project code

Projects import runtime code from packages:

```typescript
import { AppError, loadingStore } from '@xbg.solutions/bpsk-core';
import { apiService } from '@xbg.solutions/bpsk-utils-api-client';
```

Components use `$lib/` paths because they're project-local:

```typescript
import { cn } from '$lib/utils/cn';
import { Button, Card } from '$lib/components/ui';
```

---

## Key Principles

1. **Utilities are individually installable** — no monolith package dragging in unused dependencies
2. **Core framework is one package** — base types, stores, error handling, and layout components travel together
3. **Scaffolding is separate from runtime** — the CLI generates/merges project files but isn't a runtime dependency
4. **Components are copy-on-install** — `npx @xbg.solutions/bpsk add` copies from registry; project owns the source
5. **Basic atoms are agent-coded** — simple enough to code fresh with project-specific styling
6. **Extended atoms + blocks are registry-provided** — complex enough to warrant consistent starting points
7. **Test utilities are a separate dev package** — keeps production bundle clean
8. **Dependencies auto-resolve** — installing a utility automatically pulls in its @xbg dependencies via npm
