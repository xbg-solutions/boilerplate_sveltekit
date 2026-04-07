---
name: bpsk-utils
description: Pure helper utilities — class merging, error handling, route protection, and validation
---

# BPSK — Utilities

**Skill: `bpsk/utils`**

Pure helper functions that don't own state. Import what you need; there is no initialization required.

---

## Utility Inventory

| File | Key Exports | Purpose |
|---|---|---|
| `utils/cn.ts` | `cn()` | Tailwind class merging |
| `utils/error-handler.ts` | `AppError`, `normalizeError`, `withErrorHandling`, `tryCatch` | Error normalization |
| `utils/error-handler-toast.ts` | `showErrorToast`, `showSuccessToast`, `withToastNotification` | Toast shortcuts |
| `utils/route-handler.ts` | `routeHandler` | Route protection in load functions |
| `utils/auth-guard.ts` | `guardRoute`, `guardRouteServer` | Component-level route guards |
| `utils/rbac.ts` | `rbacUtil` | Role and permission checking |
| `utils/tokens.ts` | `extractClaims` | JWT claim extraction |
| `utils/browser.ts` | `browser` | SSR-safe browser detection |
| `utils/csrf.ts` | CSRF helpers | CSRF token management |
| `utils/secure-storage.ts` | `secureStorage` (`setItem`/`getItem` sync, `setItemAsync`/`getItemAsync` for AES-GCM) | Encrypted client storage (AES-GCM via Web Crypto API) |
| `utils/sanitizer.ts` | `sanitize*` | Input sanitization |
| `utils/seo.ts` | SEO helpers | Meta tag generation |
| `utils/sse.ts` | SSE helpers | Server-Sent Events |
| `utils/mutex.ts` | `mutexService` | Distributed locking |
| `utils/performance.ts` | `performanceMonitor` | Metrics tracking |
| `utils/firebase.ts` | Firebase helpers | Firebase SDK wrappers |

---

## `cn()` — Class Name Merging

The foundational utility for conditional Tailwind classes. Used in every component.

```typescript
import { cn } from '$lib/utils/cn';

// Basic merge
cn('px-4 py-2', 'bg-blue-500')
// → 'px-4 py-2 bg-blue-500'

// Conditional classes
cn('base-class', isActive && 'active-class', isDisabled && 'opacity-50')
// → 'base-class active-class' (when isActive=true, isDisabled=false)

// Tailwind conflict resolution (last class wins)
cn('px-4', 'px-6')
// → 'px-6'

// Merging with external className prop
cn('rounded-lg p-4', className)
```

```svelte
<!-- In a Svelte component -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  export let className: string = '';
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<button class={cn(
  'px-4 py-2 rounded font-medium',
  variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800',
  className
)}>
  <slot />
</button>
```

---

## `error-handler.ts` — Error Hierarchy and Utilities

### Error Classes

```typescript
import {
  AppError,          // Base class
  ApiError,          // HTTP errors (has statusCode, endpoint, method)
  AuthError,         // Auth failures (has action)
  NetworkError,      // Connectivity (has isTimeout, isOffline)
  ValidationError,   // Input validation (has field, fieldErrors)
  ApplicationError   // General app errors
} from '$lib/utils/error-handler';
```

### `normalizeError()` — Convert Anything to `AppError`

```typescript
import { normalizeError } from '$lib/utils/error-handler';

try {
  await riskyOperation();
} catch (err) {
  const appError = normalizeError(err); // Always returns AppError
  console.log(appError.message);        // string
  console.log(appError.category);       // 'api' | 'auth' | 'network' | 'validation' | 'application'
  console.log(appError.statusCode);     // number | undefined
  console.log(appError.userMessage);    // User-friendly string (may differ from technical message)
}
```

### `withErrorHandling()` — Wrap Functions

Converts thrown errors to `{ success, data, error }` return values:

```typescript
import { withErrorHandling } from '$lib/utils/error-handler';

const safeCreateUser = withErrorHandling(async (email: string, name: string) => {
  return await apiService.post<User>('/users', { email, name });
});

const result = await safeCreateUser('alice@example.com', 'Alice');
if (result.success) {
  console.log(result.data); // User
} else {
  showErrorToast(result.error);
}
```

### `tryCatch()` — Async Try/Catch Helper

```typescript
import { tryCatch } from '$lib/utils/error-handler';

const user = await tryCatch(
  () => apiService.get<User>('/users/me'),
  (err) => loggerService.error('Failed to load user', err)
);
// Returns undefined on failure (doesn't throw)
```

### Creating Custom Errors

```typescript
import { ApiError, AuthError, ValidationError } from '$lib/utils/error-handler';

throw new ApiError('Resource not found', {
  apiStatusCode: 404,
  endpoint: '/users/999',
  method: 'GET',
  userMessage: 'That user does not exist.'
});

throw new AuthError('Token expired', {
  action: 'authorize',
  userMessage: 'Your session has expired. Please sign in again.'
});

throw new ValidationError('Email invalid', {
  field: 'email',
  fieldErrors: { email: 'Must be a valid email address' }
});
```

---

## `error-handler-toast.ts` — Toast Shortcuts

```typescript
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  withToastNotification
} from '$lib/utils/error-handler-toast';

// Show an error toast from any caught error
try {
  await save();
} catch (err) {
  showErrorToast(err); // Normalizes error, shows userMessage or message
}

// Show specific-type toasts
showSuccessToast('Profile updated!');
showWarningToast('This action cannot be undone');
showInfoToast('Processing your request…');

// Wrap an operation with automatic toast feedback
const saveWithToast = withToastNotification(
  (data: FormData) => apiService.post('/profile', data),
  'Profile saved!',   // success message
  {}                  // error toast options
);

await saveWithToast(formData);
// Shows success or error toast automatically
```

---

## `routeHandler` — Route Protection in Load Functions

Use in `+page.ts` or `+layout.ts` to protect routes based on auth and claims.

```typescript
// src/routes/protected/admin/+page.ts
import { routeHandler } from '$lib/utils/route-handler';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
  const { isAuthenticated, claims } = get(authStore);

  const { hasAccess, redirect } = routeHandler.verifyAccess(
    url,
    isAuthenticated,
    claims,
    {
      claims: {
        operator: 'any', // 'all' | 'any' | 'not'
        claims: ['admin', 'sysadmin']
      },
      unauthorizedRoute: '/unauthorized'
    }
  );

  if (!hasAccess && redirect) {
    // SvelteKit redirect
    throw redirect(redirect.status, redirect.redirect);
  }

  return {};
};
```

### `createLoadFunction` — Simplified Pattern

```typescript
// src/routes/protected/+layout.ts
import { routeHandler } from '$lib/utils/route-handler';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';

export const load = routeHandler.createLoadFunction(
  () => ({
    isAuthenticated: get(authStore).isAuthenticated,
    userClaims: get(authStore).claims
  }),
  {
    claims: { operator: 'all', claims: ['admin'] }
  }
);
```

### `routeHandler` API

```typescript
routeHandler.isProtectedRoute('/protected/admin')  // → true
routeHandler.redirectToLogin('/protected/admin')   // → { status: 302, redirect: '/?returnUrl=...' }
routeHandler.redirectToUnauthorized()              // → { status: 403, redirect: '/unauthorized' }
routeHandler.getReturnUrl(url)                     // Reads ?returnUrl param safely (prevents open redirect)
routeHandler.checkUserClaims(claims, 'any', ['admin', 'consultant']) // → boolean
```

---

## `guardRoute()` — Component-Level Guard

For use in `onMount` inside components or page scripts when you can't use a `+page.ts` load function.

```typescript
import { guardRoute, guardRouteServer } from '$lib/utils/auth-guard';
import { goto } from '$app/navigation';

// Client-side guard
const result = guardRoute({
  redirectTo: '/',
  includeReturnUrl: true,
  requiredAnyRoles: ['admin', 'consultant'],
  // requiredRoles: ['admin']   // ALL roles required (AND)
});

if (result.status !== 'authorized') {
  goto(result.redirect!);
  return; // Stop component setup
}
```

```typescript
// Server-side guard (checks auth cookie only — for +layout.server.ts)
const redirect = guardRouteServer(event, { redirectTo: '/' });
if (redirect) {
  throw redirect(redirect.status, redirect.redirect);
}
```

### Navigation Helpers

```typescript
import { redirectToUnauthorized, redirectToSignIn } from '$lib/utils/auth-guard';

redirectToUnauthorized();         // goto('/unauthorized')
redirectToSignIn('/my/page');     // goto('/?returnUrl=%2Fmy%2Fpage')
```

---

## `rbacUtil` — Role and Permission Checking

The canonical way to check roles and permissions anywhere in the app.

```typescript
import { rbacUtil } from '$lib/utils/rbac';
import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';

const claims = get(authStore).claims;

// Role checks
rbacUtil.hasRole(claims, 'admin');               // → boolean (respects hierarchy)
rbacUtil.hasAnyRole(claims, ['admin', 'consultant']); // → boolean
rbacUtil.hasAllRoles(claims, ['admin', 'sysadmin']);   // → boolean

// Permission checks
rbacUtil.hasPermission(claims, 'manageUsers');   // → boolean
rbacUtil.hasAnyPermission(claims, ['manageUsers', 'viewAdminDashboard']); // → boolean
rbacUtil.getAllPermissions(claims);               // → string[]

// Get all roles
rbacUtil.getRoles(claims);  // → ['admin', 'consultant', 'client', 'user'] (with hierarchy)

// Safe versions (never throw)
rbacUtil.safeHasRole(claims, 'admin');
rbacUtil.safeHasPermission(claims, 'manageUsers');
```

### In Svelte Components

```svelte
<script lang="ts">
  import { rbacUtil } from '$lib/utils/rbac';
  import { authStore } from '$lib/stores/auth.store';

  $: claims = $authStore.claims;
  $: isAdmin = rbacUtil.hasRole(claims, 'admin');
  $: canManageUsers = rbacUtil.hasPermission(claims, 'manageUsers');
</script>

{#if isAdmin}
  <AdminPanel />
{/if}
{#if canManageUsers}
  <UserManagementButton />
{/if}
```

### Role Hierarchy Note

`hasRole` respects the hierarchy defined in `app.config.ts`. An `admin` user passes `hasRole(claims, 'consultant')` because `admin` inherits `consultant`.

### Anti-Examples

```typescript
// ❌ Manual role checking
if (claims?.roles?.includes('admin')) { ... }

// ✅ Use rbacUtil (handles hierarchy, boolean flags, normalization)
if (rbacUtil.hasRole(claims, 'admin')) { ... }

// ❌ Accessing permission strings directly
if (claims?.permissions?.includes('manageUsers')) { ... }

// ✅ Use rbacUtil
if (rbacUtil.hasPermission(claims, 'manageUsers')) { ... }
```

---

## `extractClaims()` — JWT Parsing

```typescript
import { extractClaims } from '$lib/utils/tokens';

// From a Firebase ID token string
const claims = extractClaims(idToken); // FirebaseUserClaims

// Claims shape (actual field values depend on your Firebase custom claims setup)
claims.uid       // string
claims.email     // string
claims.roles     // string[]
claims.isAdmin   // boolean
claims.isClient  // boolean
```

---

## `browser` — SSR-Safe Browser Detection

```typescript
import { browser } from '$lib/utils/browser';
// Equivalent to: import { browser } from '$app/environment';

if (browser) {
  localStorage.setItem('key', 'value');
  window.addEventListener('resize', handler);
}
```

Use this anywhere you access DOM APIs, `window`, `localStorage`, or `document`.

---

## `mutexService` — Distributed Locking

Prevents concurrent execution of operations that must be serialized.

```typescript
import { mutexService } from '$lib/utils/mutex';

// Acquire a lock
const result = await mutexService.withLock('user-update', async () => {
  // Only one caller runs this at a time
  const user = await apiService.get<User>('/users/me');
  await apiService.put('/users/me', { ...user, name: 'New Name' });
  return user;
});

// Manual lock/unlock
const lockId = await mutexService.acquire('payment-processing');
try {
  await processPayment();
} finally {
  await mutexService.release('payment-processing', lockId);
}
```

---

## `performanceMonitor` — Metrics

```typescript
import { performanceMonitor } from '$lib/utils/performance';

// Track custom metric
performanceMonitor.recordMetric('api-response-time', 142);

// Wrap and time an operation
const users = await performanceMonitor.measureOperation(
  'fetchUsers',
  () => apiService.get<User[]>('/users')
);

// Get all recorded metrics
const metrics = performanceMonitor.getMetrics();
```

---

## `sanitizer` — Input Sanitization

Sanitize any user input before storing or displaying it.

```typescript
import { sanitizeHtml, sanitizeUrl } from '$lib/utils/sanitizer';

// Remove dangerous HTML (XSS prevention)
const safe = sanitizeHtml('<script>alert(1)</script>Hello');
// → 'Hello'

// Validate and sanitize URLs
const url = sanitizeUrl('javascript:alert(1)');
// → null (dangerous) or the validated URL string
```

Also use the security config helpers for file uploads:

```typescript
import { validateFileUpload } from '$lib/config/security';
import { getSecurityConfig } from '$lib/config/security';

const { valid, errors } = validateFileUpload(file, getSecurityConfig().validation);
```

---

## `secureStorage` — Encrypted Client Storage

For sensitive data that shouldn't be stored in plain `localStorage`. Uses AES-GCM encryption via the Web Crypto API when encryption is enabled.

```typescript
import { secureStorage } from '$lib/utils/secure-storage';

// Sync API (no encryption — plain JSON storage with TTL)
secureStorage.setItem('auth-prefs', { rememberMe: true }, { ttl: 86400 });
const prefs = secureStorage.getItem<{ rememberMe: boolean }>('auth-prefs');

// Async API with AES-GCM encryption (use for sensitive data)
await secureStorage.setItemAsync('sensitive-data', payload, {
  encryption: { enabled: true, key: 'user-passphrase' },
  mechanism: 'localStorage',
  ttl: 3600
});
const data = await secureStorage.getItemAsync<MyType>('sensitive-data', {
  encryption: { enabled: true, key: 'user-passphrase' }
});

// Remove / clear
secureStorage.removeItem('auth-prefs');
secureStorage.clear(); // Remove all
```

---

## Common Utility Mistakes

```typescript
// ❌ Accessing browser APIs without guard
const token = localStorage.getItem('token'); // Fails during SSR

// ✅ Guard first
import { browser } from '$lib/utils/browser';
const token = browser ? localStorage.getItem('token') : null;

// ❌ Using raw Error class
throw new Error('Not authenticated');

// ✅ Use typed error (carries statusCode, userMessage, category)
import { AuthError } from '$lib/utils/error-handler';
throw new AuthError('Not authenticated', { action: 'authorize', userMessage: 'Please sign in.' });

// ❌ Manual class merging
const cls = 'base ' + (isActive ? 'active' : '') + ' ' + (extra || '');

// ✅ Use cn()
import { cn } from '$lib/utils/cn';
const cls = cn('base', isActive && 'active', extra);
```
