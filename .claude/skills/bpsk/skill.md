# XBG Boilerplate SvelteKit

**Skill: `bpsk`**

Master reference for the XBG Solutions SvelteKit 5 boilerplate. Use it to orient before building features, fixing bugs, or extending the project. Deeper coverage is in the sub-skills below.

---

## What This Boilerplate Is

A production-ready SvelteKit 5 foundation for **agentic, AI-assisted development**. Opinionated constraints guide agents to one-shot success.

- **SvelteKit 2** with **Svelte 5** runes and strict TypeScript
- **Firebase Auth** (email-link, phone)
- **Tailwind CSS 3 + shadcn-svelte** (30+ atomic components, 30+ page blocks)
- **Vitest** test suite
- **Singleton service pattern** throughout
- **npm workspace** with `@xbg.solutions/*` packages in `packages/`

---

## Sub-Skills

| Skill | Directory | Read When You Need To... |
|---|---|---|
| `setup` | `setup/` | Bootstrap a project, run the setup wizard, mono-repo tidy-up, deploy |
| `config` | `config/` | Understand `app.config.ts`, the two-part config model, add roles/features |
| `stores` | `stores/` | Use or extend Svelte stores (authStore, loadingStore, toastStore, etc.) |
| `services` | `services/` | Call services (authService, apiService, toastService, etc.) |
| `utils` | `utils/` | Use utility functions (cn, routeHandler, authGuard, rbacUtil, etc.) |
| `components` | `components/` | Use atomic UI components or pre-built page blocks |
| `packages` | `packages/` | npm distribution, dependency graph, import path mapping |
| `security_hardening` | `security_hardening/` | CSP/headers, Firebase security rules, App Check, CSRF, rate limiting |

---

## Project Layout

```
src/
├── lib/
│   ├── config/
│   │   ├── app.config.ts          # Single source of truth
│   │   ├── routes.config.ts       # Route metadata + RouteHelper
│   │   └── security.ts            # CSP, headers, validation
│   ├── components/
│   │   ├── ui/                    # 30+ shadcn atomic components
│   │   ├── blocks/                # 30+ pre-built page blocks
│   │   │   ├── auth/              # LoginBlock01-05, SignupBlock01-05, OtpBlock01-05
│   │   │   ├── dashboard/         # DashboardBlock01-07, ChartsBlock01
│   │   │   ├── sidebar/           # SidebarLayout01-05
│   │   │   ├── forms/             # SettingsBlock
│   │   │   ├── tasks/             # TasksBlock
│   │   │   ├── music/             # MusicBlock
│   │   │   ├── playground/        # PlaygroundBlock01-02
│   │   │   └── calendar/          # CalendarBlock01-03
│   │   ├── layout/                # AppInitializer, AuthGuard, DeferredRender, PageTransition, Seo
│   │   ├── auth/                  # EmailLinkAuth, PhoneAuth
│   │   ├── advanced/              # ChartWrapper, DataTable, FormWizard, ImageUpload
│   │   └── error/                 # ErrorBoundary, ErrorDisplay
│   ├── services/
│   │   ├── auth/                  # authService (Firebase Auth wrapper)
│   │   ├── api/                   # apiService (typed HTTP client)
│   │   ├── initialization/        # initializationService (app startup)
│   │   ├── logging/               # loggerService
│   │   ├── toast/                 # toastService
│   │   ├── events/                # eventBus, publish(), subscribe()
│   │   ├── caching/               # cacheService, apiCacheService
│   │   ├── state/                 # stateManagerService
│   │   ├── tab-sync/             # tabSyncService
│   │   ├── token/                 # tokenService
│   │   └── file-upload/           # fileUploadService
│   ├── stores/                    # auth, initialization, loading, toast, rbac, logging, etc.
│   ├── utils/                     # cn, error-handler, route-handler, auth-guard, rbac, etc.
│   ├── types/                     # TypeScript interfaces
│   ├── templates/                 # DashboardLayout, FormLayout, ContentLayout
│   └── constants/                 # api, auth, csrf, mutex, routes, secure-storage, tab-sync
├── routes/
│   ├── +layout.svelte             # Root layout
│   ├── +page.svelte               # Public home / sign-in
│   ├── protected/                 # Auth-gated routes
│   ├── confirm/                   # Email-link confirmation
│   ├── demo/                      # Component demos
│   └── unauthorized/              # 403 page
└── app.html

__scripts__/                       # setup.cjs, validate-setup.cjs, generators
__tests__/                         # Vitest (unit + integration)
packages/                          # npm workspace packages (@xbg.solutions/*)
docs/                              # Architecture docs
```

---

## Core Architectural Rules

### 1. Single Configuration File

All values flow through **`src/lib/config/app.config.ts`**.
- Secrets/IDs come from `.env` via `import.meta.env`
- Roles, permissions, feature flags live in `SETUP:start/end` marked blocks
- Run `npm run setup` or `node __scripts__/setup.cjs --config <path>` to write both
- Run `npm run validate` to verify

### 2. Atomic Components + Blocks

Use shadcn atomic components from `$lib/components/ui`. Pre-built blocks in `$lib/components/blocks` (aliased as `$blocks` in vite.config.ts) for common page patterns. Blocks compose atomic components.

### 3. Singleton Services

Every service is a module-level singleton. Import and use directly.

```typescript
import { authService } from '$lib/services/auth';
import { apiService } from '$lib/services/api';
import { toastService } from '$lib/services/toast';
```

### 4. Event-Driven Cross-Service Communication

```typescript
import { publish, subscribe } from '$lib/services/events';
publish('my:event', { data: 'value' }, 'MyComponent');
const unsub = subscribe('my:event', (event) => { /* ... */ });
```

### 5. SSR Safety

Guard all browser-only code:
```typescript
import { browser } from '$app/environment';
if (browser) { /* safe DOM/localStorage access */ }
```

### 6. Svelte 5 Runes Syntax

All components use Svelte 5 runes:
- `let { prop, children, ...rest } = $props()` (not `export let`)
- `let x = $derived(expr)` (not `$: x = expr`)
- `$effect(() => { ... })` (not `onMount`/`onDestroy`)
- `let x = $state(value)` for reactive state
- `let { value = $bindable() } = $props()` for two-way binding
- `{@render children?.()}` (not `<slot />`)
- `onclick={handler}` (not `on:click={handler}`)
- Callback props like `onSubmit?.()` (not `createEventDispatcher`)

### 7. Protected Routes

Routes under `/protected/**` require auth. The root layout enforces this. Use `routeHandler` or `guardRoute` for load-function guards.

---

## Import Conventions

```typescript
// Atomic components
import { Button, Card, CardContent, Input } from '$lib/components/ui';
import { AuthGuard, PageTransition, Seo } from '$lib/components/layout';

// Blocks
import { LoginBlock01, DashboardBlock02 } from '$lib/components/blocks';

// Config
import { APP_CONFIG, COMPUTED_CONFIG, configHelpers } from '$lib/config/app.config';

// Services
import { authService } from '$lib/services/auth';
import { apiService } from '$lib/services/api';
import { toastService } from '$lib/services/toast';
import { initializationService } from '$lib/services/initialization';
import { loggerService } from '$lib/services/logging/logging.service';
import { publish, subscribe } from '$lib/services/events';

// Stores
import { authStore } from '$lib/stores/auth.store';
import { loadingStore } from '$lib/stores/loading.store';
import { toastStore } from '$lib/stores/toast.store';
import { initializationStore } from '$lib/stores/initialization.store';

// Utils
import { cn } from '$lib/utils/cn';
import { routeHandler } from '$lib/utils/route-handler';
import { guardRoute } from '$lib/utils/auth-guard';
import { rbacUtil } from '$lib/utils/rbac';
import { normalizeError, AppError } from '$lib/utils/error-handler';
import { showErrorToast, showSuccessToast } from '$lib/utils/error-handler-toast';
```

---

## New Feature Checklist

1. **Config** — Add roles/routes/features to `app.config.ts` if needed
2. **Route** — Create `src/routes/my-feature/+page.svelte` (+ `+page.ts` for guards)
3. **Component** — Compose atomic shadcn components; use blocks for common patterns
4. **Service call** — Use `apiService.get<T>()` / `.safeGet<T>()` for data fetching
5. **Auth guard** — Add `guardRoute()` in `+page.ts` or use `AuthGuard` component
6. **Feedback** — Use `toastService.success()` / `showErrorToast()` for user feedback
7. **Test** — Add behavioral vitest tests following "test WHAT, not HOW"

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Accessing `window`/`localStorage` during SSR | Guard with `browser` check |
| Importing from deep paths like `$lib/services/auth/auth.service` | Use barrel: `$lib/services/auth` |
| Creating new service instances | Use the exported singleton |
| Modifying `authStore` directly from a component | Call `authService` methods |
| Hardcoding role strings | Use `APP_CONFIG.auth.roles.ADMIN` |
| Using `goto()` in a `load` function | Use `redirect()` from `@sveltejs/kit` |
| Using Svelte 4 syntax | Use Svelte 5 runes |
