# BPSK — Package Distribution & Development

**Skill: `bpsk/packages`**

How the boilerplate is distributed as npm packages, what lives where, how to install utilities, how to develop on top of them, and how the test suite is structured.

---

## Distribution Model Overview

The boilerplate uses a **two-part distribution model**:

1. **npm packages** (`@xbg.solutions/*`) — Runtime code that lives in `node_modules/` and updates via `npm update` with semver protection
2. **CLI scaffolding** (`@xbg.solutions/create-frontend`) — Generates project-local files (config, UI components, routes, build config) that the project owns and customizes

This means: **packages are imported, scaffolded files are copied.** An agent modifying scaffolded code (e.g., shadcn components in `src/lib/components/ui/`) is editing project-owned files. An agent using package functionality imports from `@xbg.solutions/*`.

---

## Package Map

### @xbg.solutions/frontend-core (always required)

The base framework package. Every project depends on it.

**Contains:**
- Config schema and helpers (`defineConfig()` types, validation)
- Core TypeScript types/interfaces (`api.types.ts`, `error.types.ts`, `auth.types.ts`, etc.)
- Core stores (`loading.store.ts`, `toast.store.ts`, `initialization.store.ts`, `logging.store.ts`)
- Error handler (base error normalization — `AppError`, `ApiError`, `AuthError`, `NetworkError`, `ValidationError`)
- Logging service and store (contextual logging with levels)
- Route handler utilities (`route-handler.ts`, `route-handler.store.ts`)
- Core services (`initialization.service.ts`, `toast.service.ts`)
- Base layout components (`ErrorBoundary`, `PageTransition`, `ClientOnly`)
- `cn()` utility (Tailwind class merging via `clsx` + `tailwind-merge`)
- Event bus + pub/sub system (`eventBus`, `publish`, `subscribe`)
- Mutex service for mutual exclusion

**No optional dependencies.** This is the foundation everything else builds on. Event bus and mutex are included here because they are foundational utilities used by core itself.

### @xbg.solutions/test-utils-frontend (devDependency)

Test utilities. Separate from core to keep production bundles clean — avoids shipping `vitest`, `@testing-library/svelte`, and `jsdom` to production.

**Contains:**
- `createFirebaseAuthMock()` — Mock Firebase Auth for unit tests
- `createMockStore()` — Mock Svelte stores with controlled state
- `createApiResponseMock()` — Mock API responses for service tests
- `createConsoleMock()` — Suppress/capture console output in tests
- `waitForAsync()`, `flushPromises()` — Async test helpers
- `validateFirebaseMocks()`, `resetFirebaseMocks()` — Mock validation
- Test timeout constants

**Depends on:** `@xbg.solutions/frontend-core`

### @xbg.solutions/utils-* (individually installable)

Each utility is its own package. Projects install only what they need. The CLI prompts for selection during init. Dependencies auto-resolve via npm.

| Package | What It Provides | Depends On |
|---|---|---|
| `@xbg.solutions/utils-firebase-auth` | Auth service, token service, auth/token stores, auth guard, signout | `core`, `utils-csrf`, `utils-secure-storage`, `firebase` |
| `@xbg.solutions/utils-api-client` | API service, request/response handlers, response caching | `core`, `utils-csrf` |
| `@xbg.solutions/utils-secure-storage` | AES-GCM encrypted client storage with key derivation | `core` |
| `@xbg.solutions/utils-csrf` | CSRF token generation/validation, store, constants | `core` |
| `@xbg.solutions/utils-sanitizer` | Input sanitization, XSS prevention | `core` |
| `@xbg.solutions/utils-rbac` | Role hierarchy, permission checking, store | `core` |
| `@xbg.solutions/utils-tab-sync` | Cross-tab sync via BroadcastChannel/storage events | `core`, `utils-firebase-auth` |
| `@xbg.solutions/utils-recaptcha` | reCAPTCHA v3 integration | `core` |
| `@xbg.solutions/utils-seo` | Meta tags, structured data, OpenGraph | `core` |
| `@xbg.solutions/utils-sse` | Server-sent events client | `core` |
| `@xbg.solutions/utils-performance` | Performance metrics, monitoring | `core` |
| `@xbg.solutions/utils-file-upload` | File handling with Firebase Storage | `core`, `utils-firebase-auth`, `utils-api-client` |
| `@xbg.solutions/utils-state-manager` | Global state persistence | `core`, `utils-secure-storage` |

> **Note:** Event bus, mutex, and pub/sub are included in `frontend-core` (not separate packages) to avoid circular dependencies.

### @xbg.solutions/create-frontend (CLI tool)

The project scaffolding and component registry CLI. Invoked via `npx xbg-frontend`.

**Commands:**
- **Setup**: `npx xbg-frontend setup` (interactive) or `npx xbg-frontend setup --config setup-config.json` (agent/CI)
- **Add components**: `npx xbg-frontend add otp-input block-auth block-dashboard` — copies from registry into project
- **Generators**: `npx xbg-frontend generate component <Name>`, `npx xbg-frontend generate route <path>`, `npx xbg-frontend generate service <Name>`
- **Validation**: `npx xbg-frontend validate`
- **List**: `npx xbg-frontend add list` — shows all available registry components

**Contains a component registry** with 450+ blocks across 55 categories, 16+ extended atoms, and 4 advanced components. The `add` command copies `.svelte` source files into the project (shadcn philosophy: own your source).

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

**Dependency auto-resolution:** Installing `@xbg.solutions/utils-firebase-auth` automatically pulls in `utils-csrf` and `utils-secure-storage`. No manual chaining required.

---

## Import Conventions

### In a consuming project (after npm distribution)

Projects import from `@xbg.solutions/*` packages:

```typescript
// Core — always available
import { AppError, loadingStore, initializationStore } from '@xbg.solutions/frontend-core';
import { loggerService } from '@xbg.solutions/frontend-core';
import { cn } from '@xbg.solutions/frontend-core';
import { toastService, toastStore } from '@xbg.solutions/frontend-core';
import { routeHandler } from '@xbg.solutions/frontend-core';

// Utils — only available if installed
import { authService, authStore } from '@xbg.solutions/utils-firebase-auth';
import { guardRoute, guardRouteServer } from '@xbg.solutions/utils-firebase-auth';
import { apiService } from '@xbg.solutions/utils-api-client';
import { rbacUtil, rbacStore } from '@xbg.solutions/utils-rbac';
import { secureStorage } from '@xbg.solutions/utils-secure-storage';
import { publish, subscribe, mutexService } from '@xbg.solutions/frontend-core';  // event-bus + mutex are in core
import { tabSyncService } from '@xbg.solutions/utils-tab-sync';
import { sanitizeHtml, sanitizeUrl } from '@xbg.solutions/utils-sanitizer';
import { performanceMonitor } from '@xbg.solutions/utils-performance';

// Test utils — only in test files
import { createFirebaseAuthMock, createMockStore } from '@xbg.solutions/test-utils-frontend';
import { waitForAsync, flushPromises } from '@xbg.solutions/test-utils-frontend';
```

### In the boilerplate repo itself (current state)

The boilerplate uses `$lib/` path aliases that resolve to local source:

```typescript
// These $lib/ paths map to what becomes @xbg.solutions/* packages
import { AppError } from '$lib/utils/error-handler';         // → @xbg.solutions/frontend-core
import { loadingStore } from '$lib/stores/loading.store';     // → @xbg.solutions/frontend-core
import { authService } from '$lib/services/auth';             // → @xbg.solutions/utils-firebase-auth
import { apiService } from '$lib/services/api';               // → @xbg.solutions/utils-api-client
import { rbacUtil } from '$lib/utils/rbac';                   // → @xbg.solutions/utils-rbac
import { publish, subscribe } from '$lib/services/events';    // → @xbg.solutions/utils-event-bus
```

### Import path mapping ($lib → @xbg)

| `$lib/` Path (boilerplate) | `@xbg.solutions/*` Package (consuming project) |
|---|---|
| `$lib/utils/error-handler` | `@xbg.solutions/frontend-core` |
| `$lib/utils/cn` | `@xbg.solutions/frontend-core` |
| `$lib/utils/route-handler` | `@xbg.solutions/frontend-core` |
| `$lib/stores/loading.store` | `@xbg.solutions/frontend-core` |
| `$lib/stores/toast.store` | `@xbg.solutions/frontend-core` |
| `$lib/stores/initialization.store` | `@xbg.solutions/frontend-core` |
| `$lib/stores/logging.store` | `@xbg.solutions/frontend-core` |
| `$lib/services/initialization` | `@xbg.solutions/frontend-core` |
| `$lib/services/toast` | `@xbg.solutions/frontend-core` |
| `$lib/services/logging/logging.service` | `@xbg.solutions/frontend-core` |
| `$lib/components/layout` (`ErrorBoundary`, `PageTransition`, `ClientOnly`) | `@xbg.solutions/frontend-core` |
| `$lib/services/auth` | `@xbg.solutions/utils-firebase-auth` |
| `$lib/stores/auth.store` | `@xbg.solutions/utils-firebase-auth` |
| `$lib/utils/auth-guard` | `@xbg.solutions/utils-firebase-auth` |
| `$lib/utils/tokens` | `@xbg.solutions/utils-firebase-auth` |
| `$lib/services/api` | `@xbg.solutions/utils-api-client` |
| `$lib/utils/rbac` | `@xbg.solutions/utils-rbac` |
| `$lib/stores/rbac` | `@xbg.solutions/utils-rbac` |
| `$lib/utils/secure-storage` | `@xbg.solutions/utils-secure-storage` |
| `$lib/utils/csrf` | `@xbg.solutions/utils-csrf` |
| `$lib/utils/sanitizer` | `@xbg.solutions/utils-sanitizer` |
| `$lib/services/events` | `@xbg.solutions/frontend-core` |
| `$lib/utils/mutex` | `@xbg.solutions/frontend-core` |
| `$lib/services/tab-sync` | `@xbg.solutions/utils-tab-sync` |
| `$lib/utils/performance` | `@xbg.solutions/utils-performance` |
| `$lib/utils/seo` | `@xbg.solutions/utils-seo` |
| `$lib/utils/sse` | `@xbg.solutions/utils-sse` |
| `$lib/services/state` | `@xbg.solutions/utils-state-manager` |

---

## What Is Scaffolded vs Packaged

### Scaffolded (project-owned, editable)

These files are generated by the CLI into the project. The project owns and customizes them:

- **Basic UI atoms** — `src/lib/components/ui/` — agent-coded following Svelte 5 + tv() + cn() pattern
- **Extended atoms + blocks** — copied from registry via `npx xbg-frontend add` — project owns the source
- **Auth components** — `src/lib/components/auth/` (`EmailLinkAuth`, `PhoneAuth`)
- **`app.config.ts`** — `src/lib/config/app.config.ts` (uses `defineConfig()` types from core)
- **Routes** — `src/routes/` (`+layout.svelte`, `+page.svelte`, `+error.svelte`, protected routes)
- **Build/tool config** — `svelte.config.js`, `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs`, `tsconfig.json`
- **`.env` + `.env.example`** — Generated by `npx xbg-frontend setup`
- **`app.html`**, **`app.css`** — Base HTML and global styles
- **Generated code** — Components, routes, and services created via CLI generators

### Packaged (from npm, not editable in project)

These live in `node_modules/@xbg.solutions/` and update via `npm update`:

- All `@xbg.solutions/frontend-core` exports (types, stores, services, utils, layout components)
- All `@xbg.solutions/utils-*` exports (auth, API, RBAC, events, etc.)
- All `@xbg.solutions/test-utils-frontend` exports (mocks, helpers)

**Rule:** Never copy code out of `node_modules/@xbg.solutions/` into project source. Import from the package instead.

---

## Installing a New Utility

### Direct install

```bash
npm install @xbg.solutions/utils-seo
```

### What happens after install

1. The package is added to `package.json` dependencies
2. npm auto-resolves transitive `@xbg.solutions/*` dependencies
3. Re-run `npm run setup` if you need to update `app.config.ts` role/feature blocks
4. Import from the package in your code:

```typescript
import { seoService } from '@xbg.solutions/utils-seo';
```

---

## Developing on Top of the Boilerplate

### Adding a New Feature

1. **Identify which packages you need** — Check the package map above
2. **Install if not present** — `npm install @xbg.solutions/utils-<name>`
3. **Import from the package** — Use `@xbg.solutions/*` imports (or `$lib/` in the boilerplate repo)
4. **Compose in routes** — Build features in `src/routes/`, composing packaged services with scaffolded UI components
5. **Configure in `app.config.ts`** — Add any new roles, routes, or feature flags

### Example: Adding a Feature Using Multiple Packages

```typescript
// src/routes/protected/analytics/+page.svelte
<script lang="ts">
  import { Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
  import { authStore } from '@xbg.solutions/utils-firebase-auth';         // or '$lib/stores/auth.store'
  import { apiService } from '@xbg.solutions/utils-api-client';            // or '$lib/services/api'
  import { rbacUtil } from '@xbg.solutions/utils-rbac';                    // or '$lib/utils/rbac'
  import { showErrorToast } from '@xbg.solutions/frontend-core';           // or '$lib/utils/error-handler-toast'
  import { performanceMonitor } from '@xbg.solutions/utils-performance';   // or '$lib/utils/performance'

  let data = $state<AnalyticsData | null>(null);

  $effect(() => {
    if (rbacUtil.hasRole($authStore.claims, 'admin')) {
      loadAnalytics();
    }
  });

  async function loadAnalytics() {
    const result = await performanceMonitor.measureOperation(
      'fetchAnalytics',
      () => apiService.safeGet<AnalyticsData>('/analytics')
    );
    if (result.success) {
      data = result.data;
    } else {
      showErrorToast(result.error);
    }
  }
</script>
```

### Adding a New Service to the Boilerplate

When extending the boilerplate itself (not a consuming project):

```typescript
// src/lib/services/analytics/analytics.service.ts
import { loggerService } from '$lib/services/logging/logging.service';
import { apiService } from '$lib/services/api';

const logger = loggerService.withContext('AnalyticsService');

function createAnalyticsService() {
  const trackEvent = async (name: string, properties: Record<string, any>) => {
    logger.info('Tracking event', { name, properties });
    await apiService.safePost('/analytics/events', { name, properties });
  };

  return { trackEvent };
}

export const analyticsService = createAnalyticsService();
```

Then add a barrel export:
```typescript
// src/lib/services/analytics/index.ts
export { analyticsService } from './analytics.service';
```

This service would eventually be packaged as `@xbg.solutions/utils-analytics` or similar.

---

## Test Suite Structure

### Test Configuration

The project uses **Vitest** with separate configs for different test types:

| Command | Config File | What It Tests |
|---|---|---|
| `npm test` | Runs unit + integration sequentially | Everything |
| `npm run test:unit` | `vitest.unit.config.ts` | Unit tests (isolated, mocked dependencies) |
| `npm run test:integration` | `vitest.integration.config.ts` | Integration tests (service interactions) |
| `npm run test:coverage` | Unit config + coverage | Unit test coverage report |
| `npm run test:a11y` | `vitest.a11y.config.ts` | Accessibility tests |

### Test File Location

Tests live in `__tests__/` at the project root (not colocated with source):

```
__tests__/
├── unit/
│   ├── stores/           # Store tests
│   ├── services/         # Service tests
│   ├── utils/            # Utility tests
│   └── components/       # Component tests
└── integration/
    ├── auth-flow/        # Auth workflow tests
    ├── api-flow/         # API interaction tests
    └── initialization/   # App startup tests
```

### Using Test Utilities

```typescript
// __tests__/unit/services/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// From test utils package (or $lib in boilerplate)
import {
  createFirebaseAuthMock,
  createMockStore,
  waitForAsync,
  flushPromises,
  resetFirebaseMocks
} from '@xbg.solutions/test-utils-frontend';

// Or in the boilerplate repo:
// import { createFirebaseAuthMock, ... } from '$lib/__test-utils__';

describe('authService', () => {
  let firebaseMock: ReturnType<typeof createFirebaseAuthMock>;

  beforeEach(() => {
    firebaseMock = createFirebaseAuthMock();
    resetFirebaseMocks(firebaseMock);
  });

  it('sends email link', async () => {
    firebaseMock.sendSignInLinkToEmail.mockResolvedValue(undefined);

    await authService.sendEmailLink('test@example.com');
    await flushPromises();

    expect(firebaseMock.sendSignInLinkToEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      expect.any(Object)
    );
  });
});
```

### Testing Philosophy

- **Test behavior, not implementation** — Assert what the user sees, not internal state
- **Mock at service boundaries** — Mock Firebase, API calls, and external services. Don't mock internal utilities.
- **Use the test utils package** — Consistent mocks across all tests. Don't create ad-hoc Firebase mocks.
- **677+ passing tests** — Maintain or increase coverage when adding features

```typescript
// ✅ Test behavior
test('shows error toast when save fails', async () => {
  render(MyForm);
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
});

// ❌ Don't test implementation
test('apiService.post was called', () => {
  const spy = vi.spyOn(apiService, 'post');
  // ...
});
```

---

## Key Principles

1. **Utilities are individually installable** — No monolith package dragging in unused dependencies
2. **Core framework is one package** — Base types, stores, error handling, and layout components travel together
3. **Scaffolding is separate from runtime** — The CLI generates/merges project files but isn't a runtime dependency
4. **UI components are copy-on-install** — `npx xbg-frontend add` copies from registry into project. Follows shadcn philosophy: project owns and customizes its components. Updates to the boilerplate don't affect existing projects.
5. **Test utilities are a separate dev package** — Keeps production bundle clean
6. **Dependencies auto-resolve** — Installing a utility automatically pulls in its `@xbg.solutions/*` dependencies via npm
7. **Semver protects downstream projects** — Package updates follow semver; breaking changes require major bumps

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Copying code from `node_modules/@xbg.solutions/` into `src/` | Import from the package directly |
| Installing `@xbg.solutions/test-utils-frontend` as a regular dependency | Use `--save-dev` (it's a devDependency) |
| Importing from `$lib/` in a consuming project | Use `@xbg.solutions/*` package imports |
| Manually installing transitive deps (e.g., `utils-csrf` when `utils-firebase-auth` is installed) | Let npm auto-resolve — just install the top-level package |
| Editing scaffolded `app.config.ts` outside `SETUP:start/end` markers | CLI sync may overwrite non-marked sections; put custom config outside markers |
| Creating a new utility in `src/lib/utils/` without considering which package it belongs to | Check the import path mapping table; place code in the correct package boundary |
