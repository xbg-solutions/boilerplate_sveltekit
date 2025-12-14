# Auth Guard Utility

## Overview

Route protection based on authentication state with role-based access control for SvelteKit load functions.

**Location:** `src/lib/utils/auth-guard.ts`

## Key Functions

### guardRoute
Guards a route based on authentication state.

```typescript
const result = guardRoute({
  redirectTo: '/login',
  includeReturnUrl: true,
  requiredRoles: ['admin'],
  requiredAnyRoles: ['moderator', 'admin']
});

// result: { status, redirect, error }
```

### guardRouteServer
Server-side compatible guard for SvelteKit load functions.

```typescript
export async function load(event) {
  const redirect = guardRouteServer(event, {
    redirectTo: '/login',
    includeReturnUrl: true
  });
  
  if (redirect) {
    throw SvelteKitRedirect(redirect.status, redirect.redirect);
  }
  
  return { /* data */ };
}
```

### redirectToUnauthorized
Redirects to unauthorized page.

```typescript
redirectToUnauthorized();
```

### redirectToSignIn
Redirects to sign in page.

```typescript
redirectToSignIn('/protected/settings');
```

## Options

```typescript
interface GuardOptions {
  redirectTo?: string;
  includeReturnUrl?: boolean;
  requiredRoles?: string[];
  requiredAnyRoles?: string[];
  returnUrlParam?: string;
}
```

## Common Patterns

### Protected Page
```typescript
// +page.ts
import { guardRoute } from '$lib/utils/auth-guard';

export async function load() {
  const result = guardRoute();
  
  if (result.status === 'unauthenticated') {
    throw redirect(302, result.redirect);
  }
  
  return { /* data */ };
}
```

### Role-Based Protection
```typescript
export async function load() {
  const result = guardRoute({
    requiredRoles: ['admin']
  });
  
  if (result.status === 'unauthorized') {
    throw redirect(403, result.redirect);
  }
  
  return { adminData };
}
```

### Server Load Function
```typescript
// +page.server.ts
import { guardRouteServer } from '$lib/utils/auth-guard';

export async function load(event) {
  const redirect = guardRouteServer(event);
  
  if (redirect) {
    throw SvelteKitRedirect(redirect.status, redirect.redirect);
  }
  
  return { serverData };
}
```

## Integration

- **Auth Service**: Gets authentication state
- **Route Handler**: More comprehensive alternative
- **RBAC**: For role checking

## Best Practices

1. Use in load functions
2. Check server-side too
3. Provide return URLs
4. Use role-based guards
5. Handle all status types
6. Redirect appropriately
7. Test edge cases
