# XBG Boilerplate SvelteKit — Overview

**Skill: `xbg_bpsk_overview`**

This is the master reference for the XBG Solutions SvelteKit 5 boilerplate (`boilerplate_sveltekit`). Use it to orient yourself before building features, fixing bugs, or extending the project. Deeper coverage lives in the sub-skills listed below.

---

## What This Boilerplate Is

A production-ready SvelteKit 5 foundation purpose-built for **agentic, AI-assisted development**. Its defining principle: opinionated constraints that railroad agents into one-shot success.

- **SvelteKit 5** with strict TypeScript
- **Firebase Auth** (email-link, phone, federation)
- **Tailwind CSS + SHADCN-Svelte** (30+ atomic components)
- **Vitest** test suite (677+ passing tests)
- **Singleton service pattern** throughout

---

## Sub-Skills (Read When Relevant)

| Skill | Read When You Need To… |
|---|---|
| `xbg_bpsk_setup` | Bootstrap a new project, configure `.env`, run the setup wizard, validate, deploy |
| `xbg_bpsk_config` | Understand `app.config.ts`, add roles/routes/features, change Firebase config |
| `xbg_bpsk_stores` | Use or extend Svelte stores (`authStore`, `loadingStore`, `toastStore`, etc.) |
| `xbg_bpsk_services` | Call services (`authService`, `apiService`, `toastService`, `initializationService`, etc.) |
| `xbg_bpsk_utils` | Use utility functions (`cn`, `routeHandler`, `authGuard`, `rbacUtil`, `errorHandler`, etc.) |

---

## Project Layout (Key Paths)

```
src/
├── lib/
│   ├── config/
│   │   ├── app.config.ts          ← SINGLE SOURCE OF TRUTH — edit this for new projects
│   │   ├── routes.config.ts       ← Route metadata + RouteHelper class
│   │   └── security.ts            ← CSP, headers, validation rules
│   ├── components/
│   │   ├── ui/                    ← 30+ SHADCN atomic components (Button, Card, Dialog…)
│   │   ├── layout/                ← AppInitializer, AuthGuard, HeaderNav, ClientOnly…
│   │   ├── auth/                  ← EmailLinkAuth, PhoneAuth
│   │   └── animations/            ← FadeTransition, PageTransition…
│   ├── services/
│   │   ├── auth/                  ← authService (Firebase Auth wrapper)
│   │   ├── api/                   ← apiService (typed HTTP client)
│   │   ├── initialization/        ← initializationService (app startup)
│   │   ├── logging/               ← loggerService
│   │   ├── toast/                 ← toastService
│   │   ├── events/                ← eventBus, publish(), subscribe()
│   │   ├── caching/               ← cacheService, apiCacheService
│   │   ├── state/                 ← stateManagerService
│   │   └── tab-sync/              ← tabSyncService (cross-tab comms)
│   ├── stores/
│   │   ├── auth.store.ts          ← authStore (auth state)
│   │   ├── initialization.store.ts← initializationStore
│   │   ├── loading.store.ts       ← loadingStore
│   │   ├── toast.store.ts         ← toastStore (driven by events)
│   │   ├── rbac.ts                ← rbacStore
│   │   └── logging.store.ts       ← loggerStore
│   ├── utils/
│   │   ├── cn.ts                  ← Tailwind class merging
│   │   ├── error-handler.ts       ← AppError hierarchy + helpers
│   │   ├── error-handler-toast.ts ← showErrorToast, showSuccessToast…
│   │   ├── route-handler.ts       ← routeHandler (verifyAccess, createLoadFunction)
│   │   ├── auth-guard.ts          ← guardRoute, guardRouteServer
│   │   ├── rbac.ts                ← rbacUtil (hasRole, hasPermission…)
│   │   └── tokens.ts              ← extractClaims, JWT helpers
│   └── types/                     ← TypeScript interfaces
├── routes/
│   ├── +layout.svelte             ← Root layout (subscribes to authStore, initStore)
│   ├── +page.svelte               ← Public home / sign-in page
│   ├── protected/                 ← Auth-gated routes
│   ├── confirm/                   ← Email-link confirmation page
│   └── unauthorized/              ← 403 page
__scripts__/                       ← CLI: setup.cjs, validate-setup.cjs, generators
__tests__/                         ← Vitest test suite
mcp/frontend/                      ← Legacy MCP docs (now superseded by these skills)
```

---

## Core Architectural Rules

### 1. Single Configuration File
All project-specific values live in **`src/lib/config/app.config.ts`**. Search for `FIXME` to find every customisation point when starting a new project.

### 2. Atomic Components Only
Use the 30 SHADCN atomic components from `$lib/components/ui`. Do **not** build opinionated page-level composed components into the library — compose them in routes instead.

### 3. Singleton Services
Every service is a module-level singleton export. Import and use directly; never instantiate yourself.

```typescript
// ✅ Correct
import { authService } from '$lib/services/auth';
import { apiService } from '$lib/services/api';
import { toastService } from '$lib/services/toast';

// ❌ Wrong — never do this
const myAuth = new AuthService();
```

### 4. Event-Driven Cross-Service Communication
Services communicate via the `eventBus`. Use `publish()` / `subscribe()` from `$lib/services/events`.

```typescript
import { publish, subscribe } from '$lib/services/events';

// Publish
publish('my:event', { data: 'value' }, 'MyComponent');

// Subscribe (returns an unsubscriber)
const unsub = subscribe('my:event', (event) => {
  console.log(event.payload);
});
// Call unsub() in onDestroy
```

### 5. SSR Safety
All browser-only code must be guarded. Use `browser` from `$app/environment` or `$lib/utils/browser`.

```typescript
import { browser } from '$app/environment';
if (browser) { /* safe DOM/localStorage access */ }
```

### 6. Protected Routes Convention
Any route under `/protected/**` requires authentication. The root layout (`+layout.svelte`) enforces this visually. For route-level load function guards use `routeHandler` or `guardRoute`.

---

## Import Conventions

```typescript
// Components — always from the barrel
import { Button, Card, CardContent, Input } from '$lib/components/ui';
import { AuthGuard, ClientOnly, HeaderNav } from '$lib/components/layout';

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

## Typical New-Feature Checklist

1. **Config** — Add new roles/routes/features to `app.config.ts` if needed
2. **Route** — Create `src/routes/my-feature/+page.svelte` (and `+page.ts` for guards)
3. **Component** — Compose atomic SHADCN components; don't duplicate existing layout components
4. **Service call** — Use `apiService.get<T>()` / `.safeGet<T>()` for data fetching
5. **Auth guard** — Add `guardRoute(...)` in `+page.ts` or use `AuthGuard` component
6. **Feedback** — Use `toastService.success()` / `showErrorToast()` for user feedback
7. **Test** — Add behavioral vitest tests following "test WHAT, not HOW" principle

---

## Testing Philosophy

```typescript
// ✅ Test behavior
test('shows error toast when save fails', async () => {
  render(MyForm);
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
});

// ❌ Test implementation
test('apiService.post was called', () => {
  const spy = vi.spyOn(apiService, 'post');
  // ...
});
```

Test commands:
```bash
npm test                  # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:coverage     # With coverage
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Accessing `window`/`localStorage` during SSR | Guard with `browser` check |
| Importing from deep paths like `$lib/services/auth/auth.service` | Use barrel: `$lib/services/auth` |
| Creating new service instances | Use the exported singleton |
| Modifying `authStore` directly from a component | Call `authService` methods instead |
| Hardcoding role strings | Use `APP_CONFIG.auth.roles.ADMIN` etc. |
| Using `goto()` inside a `load` function | Use `redirect()` from `@sveltejs/kit` |
