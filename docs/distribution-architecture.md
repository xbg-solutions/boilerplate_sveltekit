# XBG Frontend Boilerplate — Distribution Architecture

## Problem

Boilerplate repos are forked/cloned to start new projects. When the boilerplate is updated, there's no way to propagate changes to existing projects.

## Solution: Two-part distribution model (mirroring backend)

### Part 1: npm packages (runtime dependencies)

The boilerplate is split into installable packages that live in `node_modules/` and are imported by project code. Updates propagate via standard `npm update`. Semver protects downstream projects from breaking changes.

### Part 2: CLI scaffolding tool (project structure)

A CLI tool handles everything that isn't a runtime import — project structure, config files, UI components, templates, wiring code. It operates in two modes:

- `npx @xbg/create-frontend` — Initial setup with interactive prompts
- `npx @xbg/create-frontend --sync` — Run in existing projects to check for updates and offer new utilities

---

## Package Map

### @xbg/frontend-core (always required)

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

### @xbg/test-utils-frontend (dev dependency)

Test utilities installed as a devDependency. Kept separate from core to avoid shipping test code and test framework dependencies (`vitest`, `@testing-library/svelte`) to production.

**Contains:**
- Firebase auth mocks (`createFirebaseAuthMock()`)
- Svelte store mocks (`createMockStore()`)
- API response mocks (`createApiResponseMock()`)
- Console mocks (`createConsoleMock()`)
- Async helpers (`waitForAsync()`, `flushPromises()`)
- Mock validation utilities (`validateFirebaseMocks()`, `resetFirebaseMocks()`)
- Test timeout constants

**Depends on:** `@xbg/frontend-core`

### @xbg/utils-* (individually installable)

Each utility is its own package. Projects install only what they need. The CLI prompts for selection during init.

| Package | Description | Depends on |
|---|---|---|
| `@xbg/utils-firebase-auth` | Auth service, token service, auth/token stores, auth guard, signout | `core`, `utils-csrf`, `utils-secure-storage`, `firebase` |
| `@xbg/utils-api-client` | API service, request/response handlers, response caching | `core`, `utils-csrf` |
| `@xbg/utils-secure-storage` | Encrypted client-side storage with key derivation | `core` |
| `@xbg/utils-csrf` | CSRF token generation/validation, store, constants | `core` |
| `@xbg/utils-sanitizer` | Input sanitization, XSS prevention | `core` |
| `@xbg/utils-rbac` | Role hierarchy, permission checking, store | `core` |
| `@xbg/utils-tab-sync` | Cross-tab synchronization via BroadcastChannel/storage events | `core`, `utils-event-bus` |
| `@xbg/utils-event-bus` | Event bus + pub/sub services and stores | `core` |
| `@xbg/utils-recaptcha` | reCAPTCHA v3 integration | `core` |
| `@xbg/utils-seo` | Meta tags, structured data, OpenGraph | `core` |
| `@xbg/utils-sse` | Server-sent events client | `core` |
| `@xbg/utils-performance` | Performance metrics, monitoring | `core` |
| `@xbg/utils-file-upload` | File handling with Firebase Storage | `core`, `utils-firebase-auth` |
| `@xbg/utils-mutex` | Mutual exclusion for concurrent operations | `core` |
| `@xbg/utils-state-manager` | Global state persistence | `core` |

**Dependency auto-resolution:** When a project installs `@xbg/utils-firebase-auth`, npm automatically installs its dependencies (`utils-csrf`, `utils-secure-storage`, etc.). No manual chaining required.

### @xbg/create-frontend (CLI tool, not a runtime dependency)

Evolves from the current `__scripts__/` directory. Not installed as a project dependency — invoked via `npx`.

**Init mode** (`npx @xbg/create-frontend`):
1. Project identity (name, short name, domain, version)
2. Firebase configuration (project ID, API key, auth domain, etc.)
3. API configuration (base URLs, timeout, retry settings)
4. **Utility selection** — interactive checklist of available `@xbg/utils-*` packages
5. RBAC setup (if `utils-rbac` selected)
6. Feature flags
7. Generates project skeleton, runs `npm install` for core + selected packages
8. Writes `app.config.ts` with only relevant config sections for selected utilities
9. Scaffolds wiring code with imports from selected packages

**Sync mode** (`npx @xbg/create-frontend --sync`):
- Checks for package updates across installed `@xbg/*` packages
- Merges updated config/scaffold files
- Offers newly available utilities not yet installed
- Updates scaffolded files (config templates, build config) if boilerplate has changed

**Generators:**
- `npx @xbg/create-frontend generate component <Name>` — Svelte component with optional test/story/docs
- `npx @xbg/create-frontend generate route <path>` — Route with auth guards, load functions, role checks
- `npx @xbg/create-frontend generate service <Name>` — Service with CRUD, error handling, events

**Validation:**
- `npx @xbg/create-frontend validate` — Checks project structure, dependencies, env vars, config

---

## What the CLI scaffolds (project-local, not packaged)

These files are generated into the project and owned by the project. They are not imported from packages.

- **shadcn-svelte UI components** — Copied into `src/lib/components/ui/` per shadcn philosophy (own and customize)
- **`app.config.ts`** — Generated by the setup wizard, uses `defineConfig()` types from `@xbg/frontend-core`
- **Project skeleton** — Routes (`+layout.svelte`, `+layout.ts`, `+page.svelte`, `+error.svelte`), `app.html`, `app.css`
- **Build and tool config** — `svelte.config.js`, `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs`, `tsconfig.json`
- **`.env` file** — From interactive prompts
- **Generated code** — Components, routes, and services created via generators
- **Auth components** — `PhoneAuth`, `EmailLinkAuth` (project-local, customizable)

---

## Dependency Graph

```
@xbg/create-frontend (CLI, invoked via npx)
    │
    ▼ scaffolds project that imports from:

@xbg/frontend-core ◄─────────────────────────────┐
    ▲                                              │
    │                                              │
    ├── @xbg/utils-csrf ◄──────────────┐          │
    ├── @xbg/utils-secure-storage      │          │
    ├── @xbg/utils-firebase-auth ──────┤ (auto)   │
    │       └── depends on csrf,       │          │
    │          secure-storage           │          │
    ├── @xbg/utils-api-client ─────────┘          │
    │       └── depends on csrf                   │
    ├── @xbg/utils-event-bus ◄─────────┐          │
    ├── @xbg/utils-tab-sync ───────────┘ (auto)   │
    ├── @xbg/utils-rbac                           │
    ├── @xbg/utils-sanitizer                      │
    ├── @xbg/utils-recaptcha                      │
    ├── @xbg/utils-seo                            │
    ├── @xbg/utils-sse                            │
    ├── @xbg/utils-performance                    │
    ├── @xbg/utils-file-upload                    │
    │       └── depends on firebase-auth          │
    ├── @xbg/utils-mutex                          │
    └── @xbg/utils-state-manager                  │
                                                   │
@xbg/test-utils-frontend (devDependency) ──────────┘
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
import { AppError, loadingStore } from '@xbg/frontend-core';
import { apiService } from '@xbg/utils-api-client';
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
