---
name: bpsk-stores
description: Reactive UI state management — thin stores with minimal mutation helpers
---

# BPSK — Stores

**Skill: `bpsk/stores`**

The store layer manages reactive UI state. Stores are thin — they hold state and expose minimal mutation helpers. Business logic lives in services. Never call Firebase or API endpoints directly from store code.

---

## Store Inventory

| Store | File | Purpose |
|---|---|---|
| `authStore` | `stores/auth.store.ts` | Auth state — user, claims, auth method |
| `initializationStore` | `stores/initialization.store.ts` | App startup state |
| `loadingStore` | `stores/loading.store.ts` | Global + contextual loading states |
| `toastStore` | `stores/toast.store.ts` | Toast notifications (event-driven) |
| `rbacStore` | `stores/rbac.ts` | RBAC roles/permissions cache |
| `loggerStore` | `stores/logging.store.ts` | Logger enabled/disabled state |

---

## `authStore` — Authentication State

### State Shape

```typescript
// src/lib/stores/auth.store.ts
interface AuthState {
  isInitialized: boolean;      // Auth service has finished initializing
  isInitializing: boolean;     // Auth service is starting up
  isAuthenticated: boolean;    // User is logged in
  isLoading: boolean;          // An auth operation is in progress
  user: User | null;           // Firebase User object
  claims: FirebaseUserClaims | null; // Decoded JWT custom claims
  authMethod: 'emailLink' | 'phoneNumber' | 'federation' | null;
  lastAuthenticated: number | null;  // Timestamp
  error: AppError | null;
}
```

### Reading in Svelte Components

```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth.store';

  // Reactive — auto-updates when state changes
  $: user = $authStore.user;
  $: isAuthenticated = $authStore.isAuthenticated;
  $: claims = $authStore.claims;
  $: isLoading = $authStore.isLoading || $authStore.isInitializing;
</script>

{#if $authStore.isAuthenticated}
  <p>Welcome, {$authStore.user?.email}</p>
{:else if $authStore.isLoading}
  <Spinner />
{:else}
  <SignInPrompt />
{/if}
```

### Using the Helper Methods

`authStore` exposes extra helper methods beyond the standard Svelte store API:

```typescript
import { authStore } from '$lib/stores/auth.store';

// Use helpers instead of get(authStore).user
authStore.getUser();               // Firebase User | null
authStore.getClaims();             // FirebaseUserClaims | null
authStore.isAuthenticated();       // boolean
authStore.isLoading();             // boolean (includes isInitializing)
authStore.hasRole('admin');        // boolean — checks claims.roles
authStore.safeGet();               // Returns full state safely (no throw)
authStore.reset();                 // Resets to initial state
```

### Reading Outside Svelte Components (TypeScript files)

```typescript
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';

const state = get(authStore);
const user = state.user;

// Or use the store helpers directly
const user = authStore.getUser();
const claims = authStore.getClaims();
```

### Anti-Examples

```typescript
// ❌ Don't update authStore directly from component code
authStore.update(s => ({ ...s, isAuthenticated: true }));

// ✅ Always go through authService for auth state changes
import { authService } from '$lib/services/auth';
await authService.sendEmailLink(email);
// authStore is updated internally by authService

// ❌ Don't call authStore.reset() to "log out"
authStore.reset();

// ✅ Use the service
await authService.logout();
```

---

## `initializationStore` — App Startup State

### State Shape

```typescript
interface InitializationState {
  isInitialized: boolean;   // App is fully ready
  isInitializing: boolean;  // Startup in progress
  error: AppError | null;
  services: {
    app: boolean;   // Firebase app initialized
    auth: boolean;  // Auth service initialized
  }
}
```

### Waiting for Initialization

```svelte
<!-- Show content only once the app is ready -->
<script lang="ts">
  import { initializationStore } from '$lib/stores/initialization.store';
</script>

{#if $initializationStore.isInitialized}
  <slot />
{:else if $initializationStore.error}
  <ErrorDisplay error={$initializationStore.error} />
{:else}
  <AppLoadingSpinner />
{/if}
```

```typescript
// In TypeScript — wait for init before proceeding
import { initializationService } from '$lib/services/initialization';

await initializationService.whenInitialized();
// Safe to use authService.getCurrentUser() now
```

---

## `loadingStore` — Loading State Management

Tracks multiple concurrent loading operations with context names.

### Starting and Ending Loading

```typescript
import { loadingStore } from '$lib/stores/loading.store';

// Global loading (shows full-page spinner)
loadingStore.startLoading('global', 'fetchDashboard');
try {
  const data = await fetchData();
} finally {
  loadingStore.endLoading('global', 'fetchDashboard');
}

// Context-specific loading (scoped to a UI section)
loadingStore.startLoading('userTable', 'fetchUsers');
// ...
loadingStore.endLoading('userTable', 'fetchUsers');
```

### The `withLoading` Helper

```typescript
const result = await loadingStore.withLoading(
  () => apiService.get<User[]>('/users'),
  'userTable',
  'fetchUsers'
);
// Automatically calls start/end — even on error
```

### Using in Svelte Components

```svelte
<script lang="ts">
  import { loadingStore } from '$lib/stores/loading.store';

  // Derived store for a specific context
  const userTableLoading = loadingStore.forContext('userTable');
</script>

{#if $userTableLoading}
  <Skeleton />
{:else}
  <UserTable />
{/if}

<!-- Or check global loading -->
{#if $loadingStore.global}
  <FullPageSpinner />
{/if}
```

### Checking Loading State Imperatively

```typescript
loadingStore.isAnyLoading();           // boolean — any active operations?
loadingStore.isContextLoading('form'); // boolean — specific context?
```

---

## `toastStore` — Toast Notifications

The toast store is **event-driven**. Components read from it, but you never write to it directly. Use `toastService` to trigger toasts.

### Displaying Toasts (Read-Only)

```svelte
<!-- A toast display component — reads from store -->
<script lang="ts">
  import { toastStore } from '$lib/stores/toast.store';
  import type { ToastNotification } from '$lib/stores/toast.store';
</script>

{#each $toastStore.toasts as toast (toast.id)}
  <div class="toast toast-{toast.type}">
    {#if toast.title}<strong>{toast.title}</strong>{/if}
    <p>{toast.message}</p>
    <button on:click={() => toastStore.dismiss(toast.id)}>×</button>
  </div>
{/each}
```

### Triggering Toasts (via Service)

```typescript
import { toastService } from '$lib/services/toast';

toastService.success('Saved!');
toastService.error('Something went wrong');
toastService.warning('Check your input');
toastService.info('Processing...');
```

### `toastStore` Methods (for the display component only)

```typescript
toastStore.dismiss(id: string)  // Remove one toast
toastStore.clear()              // Remove all toasts
toastStore.setMaxToasts(5)      // Limit visible toasts
toastStore.destroy()            // Cleanup (call in onDestroy)
```

### Toast Notification Shape

```typescript
interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  duration: number;     // ms; 0 = permanent until dismissed
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  createdAt: number;    // timestamp
}
```

### Anti-Examples

```typescript
// ❌ Don't publish toast events directly
import { publish } from '$lib/services/events';
publish('toast:show', { message: 'hi' });

// ✅ Use toastService
import { toastService } from '$lib/services/toast';
toastService.info('hi');

// ❌ Don't mutate toastStore to add toasts
toastStore.update(s => ({ ...s, toasts: [...s.toasts, myToast] }));

// ✅ The store is auto-updated by the event system when toastService is called
toastService.success('Done');
```

---

## `rbacStore` — Roles and Permissions Cache

Simple writable store. Usually populated by `authService` from claims. Rarely modified directly.

```typescript
// src/lib/stores/rbac.ts
interface RoleBasedAccess {
  roles: string[];
  permissions: string[];
}

export const rbacStore = writable<RoleBasedAccess>({ roles: [], permissions: [] });
```

In components, prefer `authStore.claims` and `rbacUtil` from utils rather than `rbacStore` directly.

---

## Store Subscription Patterns

### In Svelte Components

Use the `$` prefix (auto-subscription, auto-cleanup):

```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth.store';
  // $authStore updates reactively — no manual subscription needed
</script>

<p>{$authStore.user?.email ?? 'Not signed in'}</p>
```

### In TypeScript Files (non-component)

```typescript
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';

// One-shot read
const state = get(authStore);

// Manual subscription (remember to unsubscribe)
const unsub = authStore.subscribe(state => {
  console.log('Auth changed:', state.isAuthenticated);
});
// later:
unsub();
```

### In Svelte Components with `onMount`/`onDestroy`

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth.store';
  import type { Unsubscriber } from 'svelte/store';

  let unsubscribers: Unsubscriber[] = [];

  onMount(() => {
    unsubscribers.push(
      authStore.subscribe(state => {
        // React to auth changes
      })
    );
  });

  onDestroy(() => {
    unsubscribers.forEach(u => u());
  });
</script>
```

---

## Creating a New Store

Follow the existing pattern — thin stores, factory function, singleton export:

```typescript
// src/lib/stores/my-feature.store.ts
import { writable, derived, get } from 'svelte/store';
import type { AppError } from '../utils/error-handler';

interface MyFeatureState {
  items: Item[];
  isLoading: boolean;
  error: AppError | null;
}

const initialState: MyFeatureState = {
  items: [],
  isLoading: false,
  error: null
};

function createMyFeatureStore() {
  const store = writable<MyFeatureState>(initialState);

  return {
    ...store,
    reset: () => store.set(initialState),
    // Add specific helpers if needed
  };
}

export const myFeatureStore = createMyFeatureStore();
```

**Rule:** Do not put async operations or service calls inside store files. Those belong in services.
