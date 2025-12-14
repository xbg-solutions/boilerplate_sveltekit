# Route Handler Utility

## Overview

Provides utilities for handling route protection, access control, and navigation in SvelteKit applications with support for authentication-based route protection and role-based access control using token claims.

**Location:** `src/lib/utils/route-handler.ts`

## Key Features

- Authentication-based route protection
- Role-based access control using token claims
- Redirect flows for unauthorized access
- Event integration for route access attempts
- Server and client-side load function creators
- Support for multiple role operators (all, any, not)

## Key Functions

### isProtectedRoute

Checks if a path is a protected route.

```typescript
function isProtectedRoute(path: string): boolean
```

**Usage:**
```typescript
if (isProtectedRoute('/protected/dashboard')) {
  // Perform auth check
}
```

### redirectToLogin

Redirects to the login page with a returnUrl parameter.

```typescript
function redirectToLogin(returnUrl?: string): {
  status: number;
  redirect: string;
}
```

**Usage:**
```typescript
const redirect = redirectToLogin('/protected/settings');
// Returns: { status: 302, redirect: '/login?returnUrl=%2Fprotected%2Fsettings' }
```

### redirectToUnauthorized

Redirects to the unauthorized page.

```typescript
function redirectToUnauthorized(route?: string): {
  status: number;
  redirect: string;
}
```

**Usage:**
```typescript
if (!hasPermission) {
  throw redirect(redirectToUnauthorized().redirect);
}
```

### checkUserClaims

Checks if a user has the required claims based on an operator.

```typescript
function checkUserClaims(
  userClaims: FirebaseUserClaims | null,
  operator: 'all' | 'any' | 'not',
  requiredClaims: string[]
): boolean
```

**Usage:**
```typescript
// User must have ALL specified roles
const hasAll = checkUserClaims(claims, 'all', ['admin', 'moderator']);

// User must have ANY of the specified roles
const hasAny = checkUserClaims(claims, 'any', ['admin', 'moderator']);

// User must NOT have the specified roles
const hasNone = checkUserClaims(claims, 'not', ['banned']);
```

### verifyAccess

Verifies user access to a route based on authentication and claims.

```typescript
function verifyAccess(
  url: URL,
  isAuthenticated: boolean,
  userClaims: FirebaseUserClaims | null,
  routeConfig?: RouteConfig
): {
  hasAccess: boolean;
  redirect?: { status: number; redirect: string };
}
```

**Usage:**
```typescript
const { hasAccess, redirect } = verifyAccess(
  url,
  true,
  userClaims,
  {
    claims: {
      operator: 'any',
      claims: ['admin', 'moderator']
    }
  }
);

if (!hasAccess && redirect) {
  throw redirect(redirect.redirect);
}
```

### createLoadFunction

Creates a load function for protected routes in SvelteKit.

```typescript
function createLoadFunction(
  getAuthState: () => {
    isAuthenticated: boolean;
    userClaims: FirebaseUserClaims | null;
  },
  config?: RouteConfig
): ({ url }: { url: URL }) => { routeConfig?: RouteConfig }
```

**Usage:**
```typescript
// +layout.ts
import { routeHandler } from '$lib/utils/route-handler';
import { authService } from '$lib/services/auth';

export const load = routeHandler.createLoadFunction(
  () => ({
    isAuthenticated: authService.isAuthenticated(),
    userClaims: authService.getUserClaims()
  }),
  {
    claims: {
      operator: 'any',
      claims: ['admin', 'moderator']
    },
    unauthorizedRoute: '/access-denied'
  }
);
```

### createClientLoadFunction

Creates a client-side load function for protected routes.

```typescript
function createClientLoadFunction(
  getAuthState: () => {
    isAuthenticated: boolean;
    userClaims: FirebaseUserClaims | null;
  },
  config?: RouteConfig
): ({ url }: { url: URL }) => { routeConfig?: RouteConfig }
```

**Usage:**
```typescript
// +page.ts (client-side)
import { routeHandler } from '$lib/utils/route-handler';
import { authService } from '$lib/services/auth';

export const load = routeHandler.createClientLoadFunction(
  () => ({
    isAuthenticated: authService.isAuthenticated(),
    userClaims: authService.getUserClaims()
  }),
  {
    claims: {
      operator: 'all',
      claims: ['premium', 'verified']
    }
  }
);
```

### handleRouteError

Handles errors in route protection.

```typescript
function handleRouteError(error: unknown): App.Error
```

**Usage:**
```typescript
try {
  // Route handling
} catch (error) {
  throw handleRouteError(error);
}
```

### getReturnUrl

Gets the return URL from a login page URL.

```typescript
function getReturnUrl(url: URL): string
```

**Usage:**
```typescript
// In login page
export async function load({ url }) {
  const returnUrl = routeHandler.getReturnUrl(url);
  // Use returnUrl to redirect after successful login
}
```

## Common Usage Patterns

### Protecting a Layout

```typescript
// /protected/+layout.ts
import { routeHandler } from '$lib/utils/route-handler';
import { authService } from '$lib/services/auth';

export const load = routeHandler.createLoadFunction(
  () => ({
    isAuthenticated: authService.isAuthenticated(),
    userClaims: authService.getUserClaims()
  })
);
```

### Role-Based Page Protection

```typescript
// /admin/+page.ts
import { routeHandler } from '$lib/utils/route-handler';
import { authService } from '$lib/services/auth';

export const load = routeHandler.createLoadFunction(
  () => ({
    isAuthenticated: authService.isAuthenticated(),
    userClaims: authService.getUserClaims()
  }),
  {
    claims: {
      operator: 'any',
      claims: ['admin', 'sysadmin']
    },
    unauthorizedRoute: '/access-denied'
  }
);
```

### Multiple Role Requirements

```typescript
// User must have BOTH admin AND verified claims
export const load = routeHandler.createLoadFunction(
  () => authService.getAuthState(),
  {
    claims: {
      operator: 'all',
      claims: ['admin', 'verified']
    }
  }
);
```

### Excluding Banned Users

```typescript
// User must NOT have banned claim
export const load = routeHandler.createLoadFunction(
  () => authService.getAuthState(),
  {
    claims: {
      operator: 'not',
      claims: ['banned', 'suspended']
    }
  }
);
```

### Manual Access Check

```typescript
import { routeHandler } from '$lib/utils/route-handler';

export async function load({ url }) {
  const isAuthenticated = authService.isAuthenticated();
  const userClaims = authService.getUserClaims();

  const { hasAccess, redirect } = routeHandler.verifyAccess(
    url,
    isAuthenticated,
    userClaims,
    {
      claims: {
        operator: 'any',
        claims: ['premium', 'trial']
      }
    }
  );

  if (!hasAccess && redirect) {
    throw SvelteKitRedirect(redirect.status, redirect.redirect);
  }

  return { /* page data */ };
}
```

## Route Events

The route handler publishes events for monitoring:

```typescript
// Event types
const ROUTE_EVENTS = {
  ACCESS_ATTEMPT: 'route:access-attempt',
  ACCESS_DENIED: 'route:access-denied',
  ACCESS_GRANTED: 'route:access-granted',
  ACCESS_ERROR: 'route:access-error'
};
```

**Listening to route events:**
```typescript
import { subscribe } from '$lib/services/events';

subscribe('route:access-denied', (payload) => {
  console.log('Access denied:', payload);
  // Track analytics, show notification, etc.
});
```

## Integration Points

### Auth Service

Works directly with the auth service to get authentication state and user claims.

### Event System

Publishes route access events for monitoring and analytics.

### Logger Service

Logs all route access attempts, denials, and errors via `loggerService.withContext('RouteHandler')`.

## Type Definitions

```typescript
type ClaimOperator = 'all' | 'any' | 'not';

interface RouteClaimConfig {
  operator: ClaimOperator;
  claims: string[];
}

interface RouteConfig {
  claims?: RouteClaimConfig;
  unauthorizedRoute?: string;
}
```

## Best Practices

1. **Use layout files** - Protect entire sections with layout load functions
2. **Choose appropriate operators** - Use 'all' for strict requirements, 'any' for flexible access
3. **Provide unauthorized routes** - Always specify where to redirect unauthorized users
4. **Monitor events** - Subscribe to route events for security monitoring
5. **Combine with server-side** - Always validate access on the server too
6. **Handle errors gracefully** - Use handleRouteError for consistent error handling
7. **Test thoroughly** - Test all claim combinations and edge cases
