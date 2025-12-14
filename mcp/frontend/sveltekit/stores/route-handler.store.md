# Route Handler Store

## Overview
Manages routing state, tracking the current route and whether it's a protected route. Used for navigation guards and route-based logic.

## Store Location
`src/lib/stores/route-handler.ts`

## State Structure

```typescript
interface RouteHandlerState {
  currentRoute: string | null;  // Current route path
  isProtected: boolean;         // Whether current route is protected
}
```

## Usage Examples

### Subscribe to Route State
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

routeHandlerStore.subscribe($route => {
  console.log('Current route:', $route.currentRoute);
  console.log('Is protected:', $route.isProtected);
});
```

### Set Current Route
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

routeHandlerStore.set({
  currentRoute: '/dashboard',
  isProtected: true
});
```

### Update Route
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

routeHandlerStore.update(state => ({
  ...state,
  currentRoute: '/profile'
}));
```

### Mark as Protected
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

routeHandlerStore.update(state => ({
  ...state,
  isProtected: true
}));
```

### Mark as Public
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

routeHandlerStore.update(state => ({
  ...state,
  isProtected: false
}));
```

### Clear Route State
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

routeHandlerStore.set({
  currentRoute: null,
  isProtected: false
});
```

### Check if Current Route is Protected
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';
import { get } from 'svelte/store';

const $route = get(routeHandlerStore);

if ($route.isProtected) {
  // Require authentication
}
```

### Navigation Handler
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';
import { goto } from '$app/navigation';

const protectedRoutes = ['/dashboard', '/profile', '/settings'];

function handleNavigation(path: string) {
  const isProtected = protectedRoutes.includes(path);

  routeHandlerStore.set({
    currentRoute: path,
    isProtected
  });

  goto(path);
}
```

### Route Guard
```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';
import { authStore } from '$lib/stores/auth.store';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export function routeGuard(path: string) {
  const $route = get(routeHandlerStore);
  const $auth = get(authStore);

  if ($route.isProtected && !$auth.isAuthenticated) {
    throw redirect(303, '/login?redirect=' + path);
  }
}
```

## Integration Points

- **SvelteKit Navigation** - Track page navigation
- **Auth Store** (`src/lib/stores/auth.store.ts`) - Check auth for protected routes
- **Route Guards** - Prevent unauthorized access
- **Breadcrumbs** - Display current location
- **Navigation Menu** - Highlight active route

## Protected Route Configuration

```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/api/*'
];

const publicRoutes = [
  '/',
  '/about',
  '/login',
  '/register'
];

function isRouteProtected(path: string): boolean {
  return protectedRoutes.some(route => {
    if (route.endsWith('/*')) {
      return path.startsWith(route.slice(0, -2));
    }
    return path === route;
  });
}

function updateRouteState(path: string) {
  routeHandlerStore.set({
    currentRoute: path,
    isProtected: isRouteProtected(path)
  });
}
```

## SvelteKit Integration

```typescript
// In +layout.svelte or navigation component
import { page } from '$app/stores';
import { routeHandlerStore } from '$lib/stores/route-handler';

$: {
  const path = $page.url.pathname;
  routeHandlerStore.update(state => ({
    ...state,
    currentRoute: path
  }));
}
```

## Component Usage

```svelte
<script>
  import { routeHandlerStore } from '$lib/stores/route-handler';
  import { authStore } from '$lib/stores/auth.store';

  $: needsAuth = $routeHandlerStore.isProtected &&
                 !$authStore.isAuthenticated;
</script>

{#if needsAuth}
  <div class="auth-required">
    Please log in to access this page.
  </div>
{/if}
```

## Route Change Detection

```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';

let previousRoute: string | null = null;

routeHandlerStore.subscribe($route => {
  if (previousRoute !== $route.currentRoute) {
    console.log('Route changed:', {
      from: previousRoute,
      to: $route.currentRoute
    });

    // Perform route change logic
    onRouteChange($route.currentRoute);

    previousRoute = $route.currentRoute;
  }
});
```

## Redirect After Login

```typescript
import { routeHandlerStore } from '$lib/stores/route-handler';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

async function loginAndRedirect() {
  await login();

  const $route = get(routeHandlerStore);
  const redirectTo = $route.currentRoute || '/dashboard';

  goto(redirectTo);
}
```

## Best Practices

1. Update route state on every navigation
2. Define protected routes in a centralized configuration
3. Always check authentication for protected routes
4. Store intended route for post-login redirect
5. Clear route state on logout if needed
6. Use route state for conditional rendering
7. Integrate with SvelteKit's page store
8. Handle route patterns (wildcards, parameters)
9. Validate route access on both client and server
10. Track route history for back navigation
