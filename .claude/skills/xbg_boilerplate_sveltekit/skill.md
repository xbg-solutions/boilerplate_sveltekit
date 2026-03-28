# XBG Boilerplate SvelteKit

**Skill: `xbg_boilerplate_sveltekit`**

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

| Skill | Directory | Read When You Need To… |
|---|---|---|
| `setup` | `setup/` | Bootstrap a new project, run the 8-step wizard, handle mono-repo tidy-up, deploy |
| `config` | `config/` | Understand `app.config.ts`, the two-part config model, add roles/claims/features |
| `stores` | `stores/` | Use or extend Svelte stores (`authStore`, `loadingStore`, `toastStore`, etc.) |
| `services` | `services/` | Call services (`authService`, `apiService`, `toastService`, `initializationService`, etc.) |
| `utils` | `utils/` | Use utility functions (`cn`, `routeHandler`, `authGuard`, `rbacUtil`, `errorHandler`, etc.) |
| `components` | `components/` | Use atomic UI components or pre-built page blocks (auth, dashboard, sidebar, etc.) |
| `packages` | `packages/` | npm distribution (`@xbg.solutions/*` packages), dependency graph, import path mapping, test suite structure |
| `security_hardening` | `security_hardening/` | Security hardening, CSP/headers, Firebase security rules, App Check, rate limiting, CSRF protection |

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
│   │   ├── ui/                    ← 40+ SHADCN atomic components (Button, Card, Dialog…)
│   │   ├── blocks/                ← Pre-built page blocks (auth, dashboard, sidebar…)
│   │   │   ├── auth/              ← LoginBlock01–05, SignupBlock01–05, OtpBlock01–05
│   │   │   ├── dashboard/         ← DashboardBlock01–07, ChartsBlock01
│   │   │   ├── sidebar/           ← SidebarLayout01–05
│   │   │   ├── forms/             ← SettingsBlock
│   │   │   ├── tasks/             ← TasksBlock
│   │   │   ├── music/             ← MusicBlock
│   │   │   ├── playground/        ← PlaygroundBlock01–02
│   │   │   └── calendar/          ← CalendarBlock01–03
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
__scripts__/                       ← setup.cjs (8-step wizard, supports --config), validate-setup.cjs, generators
__tests__/                         ← Vitest test suite
mcp/frontend/                      ← Legacy MCP docs (superseded by .claude/skills/)
```

---

## Core Architectural Rules

### 1. Single Configuration File
All project-specific values flow through **`src/lib/config/app.config.ts`**.
- **Secrets / IDs** (Firebase, API URLs, app name) come from `.env` via `import.meta.env`
- **Structural config** (roles, permissions, feature flags) live in `app.config.ts` in `SETUP:start/end` marked blocks
- Run `npm run setup` (interactive) or `node __scripts__/setup.cjs --config <path>` (non-interactive) to write both; run `npm run validate` to verify

There are no `FIXME` placeholders — the wizard eliminates them.

### 2. Atomic Components + Optional Blocks
Use the 40+ SHADCN atomic components from `$lib/components/ui`. Pre-built page-level **blocks** are available in `$lib/components/blocks` (or `$blocks`) for common patterns like auth pages, dashboards, and settings. Blocks compose atomic components — pick a block variant and customize via props/slots, or compose your own from atomic components.

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

### 6. Svelte Syntax Convention
This boilerplate uses **Svelte 4 component syntax** running on Svelte 5. All 40+ existing components follow `export let` props, `$$restProps`, `<slot />`, `on:click` event forwarding, and `$:` reactive declarations. Follow the existing patterns when adding or modifying components.

The `svelte5_sveltekit` skill in this repo documents Svelte 5 runes (`$props()`, `$state()`, `$effect()`) for reference — these describe the runtime, not the coding convention for this project. Do not mix runes-based code into existing Svelte 4-style components.

### 7. Protected Routes Convention
Any route under `/protected/**` requires authentication. The root layout (`+layout.svelte`) enforces this visually. For route-level load function guards use `routeHandler` or `guardRoute`.

---

## Import Conventions

```typescript
// Atomic components — from the barrel
import { Button, Card, CardContent, Input } from '$lib/components/ui';
import { AuthGuard, ClientOnly, HeaderNav } from '$lib/components/layout';

// Pre-built blocks — optional imports
import { LoginBlock01, DashboardBlock02 } from '$lib/components/blocks';
import { SidebarLayout01 } from '$blocks/sidebar';

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
