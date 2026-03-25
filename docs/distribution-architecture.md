# XBG Frontend Boilerplate — Distribution Architecture

## Problem

Boilerplate repos are forked/cloned to start new projects. When the boilerplate is updated, there's no way to propagate changes to existing projects.

## Solution: Two-part distribution model (mirroring backend)

### Part 1: npm packages (runtime dependencies)

The boilerplate is split into installable packages that live in `node_modules/` and are imported by project code. Updates propagate via standard `npm update`. Semver protects downstream projects from breaking changes.

### Part 2: CLI scaffolding tool (project structure)

A CLI tool handles everything that isn't a runtime import — project structure, config files, UI components, templates, wiring code. It operates in two modes:

- `npx @xbg.solutions/create-frontend` — Initial setup with interactive prompts
- `npx @xbg.solutions/create-frontend --sync` — Run in existing projects to check for updates and offer new utilities

---

## Package Map

### @xbg.solutions/frontend-core (always required)

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

**No optional dependencies.** This is the foundation everything else builds on. Essential utilities like logging are included here rather than as separate packages — every project needs them.

### @xbg.solutions/test-utils-frontend (dev dependency)

Test utilities installed as a devDependency. Kept separate from core to avoid shipping test code and test framework dependencies (`vitest`, `@testing-library/svelte`) to production.

**Contains:**
- Firebase auth mocks (`createFirebaseAuthMock()`)
- Svelte store mocks (`createMockStore()`)
- API response mocks (`createApiResponseMock()`)
- Console mocks (`createConsoleMock()`)
- Async helpers (`waitForAsync()`, `flushPromises()`)
- Mock validation utilities (`validateFirebaseMocks()`, `resetFirebaseMocks()`)
- Test timeout constants

**Depends on:** `@xbg.solutions/frontend-core`

### @xbg.solutions/utils-* (individually installable)

Each utility is its own package. Projects install only what they need. The CLI prompts for selection during init.

| Package | Description | Depends on |
|---|---|---|
| `@xbg.solutions/utils-firebase-auth` | Auth service, token service, auth/token stores, auth guard, signout | `core`, `utils-csrf`, `utils-secure-storage`, `firebase` |
| `@xbg.solutions/utils-api-client` | API service, request/response handlers, response caching | `core`, `utils-csrf` |
| `@xbg.solutions/utils-secure-storage` | Encrypted client-side storage with key derivation | `core` |
| `@xbg.solutions/utils-csrf` | CSRF token generation/validation, store, constants | `core` |
| `@xbg.solutions/utils-sanitizer` | Input sanitization, XSS prevention | `core` |
| `@xbg.solutions/utils-rbac` | Role hierarchy, permission checking, store | `core` |
| `@xbg.solutions/utils-tab-sync` | Cross-tab synchronization via BroadcastChannel/storage events | `core`, `utils-firebase-auth` |
| `@xbg.solutions/utils-recaptcha` | reCAPTCHA v3 integration | `core` |
| `@xbg.solutions/utils-seo` | Meta tags, structured data, OpenGraph | `core` |
| `@xbg.solutions/utils-sse` | Server-sent events client | `core` |
| `@xbg.solutions/utils-performance` | Performance metrics, monitoring | `core` |
| `@xbg.solutions/utils-file-upload` | File handling with Firebase Storage | `core`, `utils-firebase-auth`, `utils-api-client` |
| `@xbg.solutions/utils-state-manager` | Global state persistence | `core`, `utils-secure-storage` |

> **Note:** `utils-event-bus` and `utils-mutex` were merged into `frontend-core` to avoid circular dependencies. The event bus and mutex are foundational utilities used by core itself.

**Dependency auto-resolution:** When a project installs `@xbg.solutions/utils-firebase-auth`, npm automatically installs its dependencies (`utils-csrf`, `utils-secure-storage`, etc.). No manual chaining required.

### @xbg.solutions/create-frontend (CLI tool, not a runtime dependency)

Evolves from the current `__scripts__/` directory. Not installed as a project dependency — invoked via `npx`.

**Init mode** (`npx @xbg.solutions/create-frontend`):
1. Project identity (name, short name, domain, version)
2. Firebase configuration (project ID, API key, auth domain, etc.)
3. API configuration (base URLs, timeout, retry settings)
4. **Utility selection** — interactive checklist of available `@xbg.solutions/utils-*` packages
5. RBAC setup (if `utils-rbac` selected)
6. Feature flags
7. Generates project skeleton, runs `npm install` for core + selected packages
8. Writes `app.config.ts` with only relevant config sections for selected utilities
9. Scaffolds wiring code with imports from selected packages

**Sync mode** (`npx @xbg.solutions/create-frontend --sync`):
- Checks for package updates across installed `@xbg.solutions/*` packages
- Merges updated config/scaffold files
- Offers newly available utilities not yet installed
- Updates scaffolded files (config templates, build config) if boilerplate has changed

**Generators:**
- `npx @xbg.solutions/create-frontend generate component <Name>` — Svelte component with optional test/story/docs
- `npx @xbg.solutions/create-frontend generate route <path>` — Route with auth guards, load functions, role checks
- `npx @xbg.solutions/create-frontend generate service <Name>` — Service with CRUD, error handling, events

**Validation:**
- `npx @xbg.solutions/create-frontend validate` — Checks project structure, dependencies, env vars, config

---

## What the CLI scaffolds (project-local, not packaged)

These files are generated into the project and owned by the project. They are not imported from packages.

- **shadcn-svelte UI components** — Copied into `src/lib/components/ui/` per shadcn philosophy (own and customize)
- **`app.config.ts`** — Generated by the setup wizard, uses `defineConfig()` types from `@xbg.solutions/frontend-core`
- **Project skeleton** — Routes (`+layout.svelte`, `+layout.ts`, `+page.svelte`, `+error.svelte`), `app.html`, `app.css`
- **Build and tool config** — `svelte.config.js`, `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs`, `tsconfig.json`
- **`.env` file** — From interactive prompts
- **Generated code** — Components, routes, and services created via generators
- **Auth components** — `PhoneAuth`, `EmailLinkAuth` (project-local, customizable)

---

## Dependency Graph

```
@xbg.solutions/create-frontend (CLI, invoked via npx)
    │
    ▼ scaffolds project that imports from:

@xbg.solutions/frontend-core ◄─────────────────────────────┐
    ▲  (includes event-bus, mutex, logging, errors)         │
    │                                                       │
    ├── @xbg.solutions/utils-csrf ◄──────────────┐          │
    ├── @xbg.solutions/utils-secure-storage      │          │
    ├── @xbg.solutions/utils-firebase-auth ──────┤ (auto)   │
    │       └── depends on csrf,                 │          │
    │          secure-storage, rbac              │          │
    ├── @xbg.solutions/utils-api-client ─────────┘          │
    │       └── depends on csrf                             │
    ├── @xbg.solutions/utils-tab-sync                       │
    │       └── depends on firebase-auth                    │
    ├── @xbg.solutions/utils-rbac                           │
    ├── @xbg.solutions/utils-sanitizer                      │
    ├── @xbg.solutions/utils-recaptcha                      │
    ├── @xbg.solutions/utils-seo                            │
    ├── @xbg.solutions/utils-sse                            │
    ├── @xbg.solutions/utils-performance                    │
    ├── @xbg.solutions/utils-file-upload                    │
    │       └── depends on firebase-auth, api-client        │
    └── @xbg.solutions/utils-state-manager                  │
            └── depends on secure-storage                   │
                                                            │
@xbg.solutions/test-utils-frontend (devDependency) ────────┘
```

---

## What changes in project code

Instead of relative imports from copied boilerplate files:

```typescript
import { AppError } from '../../utils/error-handler';
import { loadingStore } from '../../stores/loading.store';
import { apiService } from '../../services/api/api.service';
```

Projects import from packages:

```typescript
import { AppError, loadingStore } from '@xbg.solutions/frontend-core';
import { apiService } from '@xbg.solutions/utils-api-client';
```

---

## Key Principles

1. **Utilities are individually installable** — no monolith package dragging in unused dependencies
2. **Core framework is one package** — base types, stores, error handling, and layout components travel together
3. **Scaffolding is separate from runtime** — the CLI generates/merges project files but isn't a runtime dependency
4. **Setup script becomes the CLI** — the existing interactive setup wizard evolves into the CLI's init flow, including utility selection
5. **UI components are scaffolded, not packaged** — follows shadcn philosophy: project owns and customizes its components
6. **Code generators stay project-local** — generated components, routes, and services live in the project and import from packages
7. **Test utilities are a separate dev package** — keeps production bundle clean, avoids shipping vitest/testing-library
8. **Dependencies auto-resolve** — installing a utility automatically pulls in its @xbg dependencies via npm
9. **MCP docs removed** — project uses `.claude/` skill files for AI agent context instead
