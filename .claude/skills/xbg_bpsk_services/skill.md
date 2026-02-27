# XBG Boilerplate SvelteKit — Services

**Skill: `xbg_bpsk_services`**

Services are singleton instances that encapsulate business logic. They own state mutations (via stores), API calls, and cross-service coordination. Components and route load functions call services — they never implement business logic themselves.

---

## Service Inventory

| Import Path | Singleton | Purpose |
|---|---|---|
| `$lib/services/auth` | `authService` | Firebase Auth wrapper |
| `$lib/services/api` | `apiService` | Typed HTTP client |
| `$lib/services/initialization` | `initializationService` | App startup |
| `$lib/services/logging/logging.service` | `loggerService` | Structured logging |
| `$lib/services/toast` | `toastService` | Toast notifications |
| `$lib/services/events` | `publish`, `subscribe` | Event bus (module-level) |
| `$lib/services/caching` | `cacheService`, `apiCacheService` | Response caching |
| `$lib/services/state` | `stateManagerService` | Global state management |
| `$lib/services/tab-sync` | `tabSyncService` | Cross-tab coordination |

---

## `authService` — Authentication

### Initialization

`authService` is initialized by `initializationService` at app startup. You do not call `authService.initialize()` yourself in normal usage.

### Sending an Email Link (Passwordless Auth)

```typescript
import { authService } from '$lib/services/auth';

// Send magic link
const result = await authService.sendEmailLink('user@example.com');
if (result.success) {
  // Email sent — show confirmation UI
} else {
  console.error(result.error);
}
```

### Verifying an Email Link (on /confirm route)

```typescript
// src/routes/confirm/+page.ts
import { authService } from '$lib/services/auth';

// Called when the user lands on the confirmation page after clicking the link
const result = await authService.verifyEmailLink({
  returnUrl: '/protected'
});
// On success, authService calls goto(returnUrl) automatically
```

### Phone Authentication

```typescript
// Step 1: Send code
const result = await authService.sendPhoneCode('+15551234567', recaptchaVerifier);
const { verificationId } = result;

// Step 2: Verify code
await authService.verifyPhoneCode('123456', verificationId);
// On success, navigates to AUTH_ROUTES.SUCCESS automatically
```

### Checking Auth State

```typescript
authService.isAuthenticated();     // boolean
authService.getCurrentUser();      // Firebase User | null
authService.getUserClaims();       // FirebaseUserClaims | null
authService.userHasRole('admin');  // boolean
authService.userHasAnyRole(['admin', 'consultant']); // boolean
```

### Logout

```typescript
await authService.logout();
// Clears stored email, publishes LOGOUT event, Firebase signOut, redirects to /?logout=true
```

### Safe Wrapper Functions

For fire-and-forget scenarios, pre-wrapped safe versions are exported:

```typescript
import { safeSendEmailLink, safeVerifyEmailLink, safeLogout } from '$lib/services/auth/auth.service';

const { success, data, error } = await safeSendEmailLink('user@example.com');
```

### Anti-Examples

```typescript
// ❌ Don't import Firebase directly for auth
import { getAuth, signInWithEmailLink } from 'firebase/auth';
signInWithEmailLink(getAuth(), email, window.location.href);

// ✅ Use authService — it handles token processing, store updates, events
await authService.verifyEmailLink();

// ❌ Don't manually update authStore after a sign-in
authStore.update(s => ({ ...s, isAuthenticated: true }));

// ✅ authService.verifyEmailLink() does that automatically via the Firebase listener
```

---

## `apiService` — Typed HTTP Client

All API calls go through this service. It handles CSRF tokens, Firebase auth headers, retry logic, and request deduplication automatically.

### Basic Usage

```typescript
import { apiService } from '$lib/services/api';

// GET
const users = await apiService.get<User[]>('/users');

// POST
const newUser = await apiService.post<User>('/users', { name: 'Alice', email: 'alice@example.com' });

// PUT
const updated = await apiService.put<User>('/users/123', { name: 'Alice B.' });

// PATCH
const patched = await apiService.patch<User>('/users/123', { active: false });

// DELETE
await apiService.delete('/users/123');
```

The base URL is automatically resolved from `APP_CONFIG.api.baseUrl` based on the environment.

### Query Parameters

```typescript
const result = await apiService.get<PagedResult<User>>('/users', {
  params: { page: 1, limit: 20, search: 'alice' }
});
// → GET /users?page=1&limit=20&search=alice
```

### `RequestOptions`

```typescript
interface RequestOptions {
  params?: Record<string, any>;      // Query parameters
  timeout?: number;                   // Override default 30s timeout
  retryCount?: number;               // Override default retry count
  skipDeduplication?: boolean;       // Allow duplicate in-flight GETs
  headers?: Record<string, string>;  // Extra headers
}
```

### Safe Variants (Never Throw)

Prefer `safe*` methods in component code so you handle errors gracefully:

```typescript
const { success, data, error } = await apiService.safeGet<User[]>('/users');
if (success) {
  // use data
} else {
  showErrorToast(error);
}

const { success, data } = await apiService.safePost<User>('/users', payload);
// Also: safePut, safePatch, safeDelete
```

### Retry Behaviour

The service automatically retries on:
- Network errors (non-offline)
- Server errors (5xx) marked `isRetryable`
- Auth token refresh (retries immediately with fresh token)

Retries use exponential backoff with jitter: `baseDelay * 2^(retryCount-1) * random(0.8–1.2)`.

### Anti-Examples

```typescript
// ❌ Don't use fetch() directly for API calls
const res = await fetch(`${baseUrl}/users`);

// ✅ Use apiService — it handles auth, CSRF, retries
const users = await apiService.get<User[]>('/users');

// ❌ Don't catch errors you don't handle
try {
  await apiService.post('/users', data);
} catch (e) {
  console.log(e); // user sees nothing
}

// ✅ Use safe variant and show feedback
const { success, error } = await apiService.safePost('/users', data);
if (!success) showErrorToast(error);
```

---

## `initializationService` — App Startup

Usually called once from the root layout's `AppInitializer` component. You rarely call it directly.

```typescript
import { initializationService } from '$lib/services/initialization';
import { APP_CONFIG } from '$lib/config/app.config';

// In AppInitializer.svelte or root layout's onMount:
await initializationService.initialize({
  firebaseConfig: APP_CONFIG.firebase,
  useEmulators: false  // set true for local development with Firebase emulators
});
```

### Waiting for Init

```typescript
// Wait for initialization to complete (useful in tests or lazy-loaded modules)
await initializationService.whenInitialized();
```

### Initialization Sequence

```
initializationService.initialize()
  1. initializeApp(firebaseConfig)  → Firebase SDK
  2. authService.initialize()       → Firebase auth listener
  3. tabSyncService.initialize()    → Cross-tab coordination
  4. publish('app:initialized')
  → initializationStore.isInitialized = true
```

---

## `loggerService` — Structured Logging

Context-aware, environment-sensitive logging. Logs are suppressed in production unless `?verboseLogging=1` is in the URL.

### Basic Usage

```typescript
import { loggerService } from '$lib/services/logging/logging.service';

loggerService.info('User logged in');
loggerService.warn('Token about to expire', { expiresIn: 300 });
loggerService.error('Fetch failed', new Error('Network error'), { url: '/users' });
loggerService.debug('Cache hit', { key: 'users-list' });
```

### Context-Aware Logger (Recommended)

Create a named logger per file/component so logs are easily searchable:

```typescript
// In any service, component, or util
const logger = loggerService.withContext('UserDashboard');

logger.info('Page loaded');
logger.warn('User lacks permissions', { userId: '123' });
logger.error('Save failed', error, { formData: payload });
```

### Performance Timing

```typescript
const timerId = loggerService.startTimer('fetchUsers');
const users = await apiService.get<User[]>('/users');
loggerService.endTimer(timerId, { count: users.length });
// Logs: "fetchUsers completed in 142.50ms"
```

### Enable Verbose Logging in Production

Append `?verboseLogging=1` to any URL to enable info/warn logs in production.

---

## `toastService` — Toast Notifications

```typescript
import { toastService } from '$lib/services/toast';

toastService.success('Profile saved!');
toastService.error('Could not save. Try again.', { duration: 10000 });
toastService.warning('Session expiring soon', { duration: 8000 });
toastService.info('Changes are pending approval');

// Full control
toastService.show({
  type: 'success',
  message: 'Done!',
  title: 'Import Complete',
  duration: 5000,         // ms; 0 = permanent
  dismissible: true,
  position: 'top-right',
});

// Dismiss or clear
toastService.hide(toastId);
toastService.clear();
```

Toasts flow through the event bus:
```
toastService.success() → publish(TOAST_SHOW) → toastStore updated → UI renders
```

---

## `publish` / `subscribe` — Event Bus

Low-level cross-service communication. Prefer service method calls for component code; use events for service-to-service coordination.

```typescript
import { publish, subscribe } from '$lib/services/events';

// Publish (async — awaitable but you can fire-and-forget)
publish('user:profile-updated', { userId: '123', changes: { name: 'Bob' } }, 'ProfileService');

// Subscribe — returns unsubscriber
const unsub = subscribe('user:profile-updated', (event) => {
  console.log(event.payload.userId);
  console.log(event.source);    // 'ProfileService'
  console.log(event.timestamp); // Unix ms
});

// Wildcard pattern subscription
const unsub2 = subscribe('auth:*', (event) => {
  console.log('Auth event:', event.type);
});

// Always unsubscribe in onDestroy
onDestroy(() => {
  unsub();
  unsub2();
});
```

### Built-in Event Types

```typescript
import { AUTH_EVENTS } from '$lib/constants/auth.constants';
import { CoreEventType } from '$lib/types/event.types';

// Auth events
AUTH_EVENTS.STATE_CHANGED  // user signed in/out
AUTH_EVENTS.LOGIN_SUCCESS
AUTH_EVENTS.LOGOUT

// Toast events
CoreEventType.TOAST_SHOW
CoreEventType.TOAST_HIDE
CoreEventType.TOAST_CLEAR
```

---

## `tabSyncService` — Cross-Tab Coordination

Automatically initialized by `initializationService`. Handles auth state synchronization across browser tabs (e.g., logging out in one tab logs out all tabs).

### Listening to Tab Events in a Component

```typescript
import { subscribe } from '$lib/services/events';
import { TAB_SYNC_EVENTS } from '$lib/constants/tab-sync.constants';

onMount(() => {
  const unsub = subscribe(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, (payload) => {
    if (payload.action === 'logout') {
      window.location.reload(); // Force re-auth
    }
  });
  return unsub; // onMount's return is called as cleanup
});
```

### Sending Custom Messages Between Tabs

```typescript
import { tabSyncService } from '$lib/services/tab-sync';

await tabSyncService.sendMessage('user:preference-changed', { theme: 'dark' });
```

---

## `cacheService` / `apiCacheService` — Caching

```typescript
import { cacheService } from '$lib/services/caching';

// Store a value
cacheService.set('users-list', users, { ttl: 300 }); // 5 min TTL

// Retrieve
const cached = cacheService.get<User[]>('users-list');

// Invalidate
cacheService.delete('users-list');
cacheService.clear(); // Nuke all
```

For API responses with automatic cache:

```typescript
import { apiCacheService } from '$lib/services/caching';

const users = await apiCacheService.get<User[]>('/users', { ttl: 300 });
```

---

## Service Lifecycle

Services are singletons initialized at module load time. They don't need to be destroyed in normal usage. The `authService.destroy()` and similar methods exist for tests.

```typescript
// ✅ Services are ready to use at any time after app init
import { authService } from '$lib/services/auth';
authService.isAuthenticated(); // safe

// ❌ Don't try to construct services
const svc = new AuthService(); // This class is not exported
```

---

## Adding a New Service

Follow the factory + singleton pattern:

```typescript
// src/lib/services/analytics/analytics.service.ts
import { loggerService } from '../logging/logging.service';
import { apiService } from '../api';

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
