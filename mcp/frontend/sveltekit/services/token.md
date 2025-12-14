# Token Service

## Overview

The Token Service manages the complete lifecycle of authentication tokens, including acquisition, storage, validation, refresh, and expiration handling. It provides role-based access control (RBAC) capabilities and integrates seamlessly with Firebase Authentication.

**Location:** `src/lib/services/token/token.service.ts`

## Key Features

- Token lifecycle management (acquire, store, refresh, clear)
- JWT decoding and claim extraction
- Role-based access control (RBAC)
- Permission checking
- Automatic token refresh scheduling
- Firebase Auth integration
- Secure token storage
- Token validation and expiration checking
- Event-driven updates

## Core Methods

### Token Management

#### `initialize(): Promise<void>`

Initializes the token service, loads existing tokens, and sets up auth listeners.

```typescript
import { tokenService } from '$lib/services/token/token.service';

// Initialize on app startup
await tokenService.initialize();
```

#### `getToken(): string | null`

Gets the current authentication token.

```typescript
const token = tokenService.getToken();

if (token) {
  // Use token for API requests
}
```

#### `refreshToken(): Promise<TokenRefreshResult>`

Manually refreshes the authentication token.

```typescript
const result = await tokenService.refreshToken();

if (result.success) {
  console.log('Token refreshed:', result.token);
  console.log('Token changed:', result.changed);
} else {
  console.error('Refresh failed:', result.error);
}
```

#### `processToken(token: string): Promise<boolean>`

Processes and stores a new token (typically called by auth service).

```typescript
const success = await tokenService.processToken(newToken);

if (success) {
  // Token stored and state updated
}
```

#### `clearTokenState(): void`

Clears all token data (used during logout).

```typescript
tokenService.clearTokenState();
```

### Claims and User Information

#### `getClaims(): FirebaseUserClaims | null`

Gets the decoded token claims.

```typescript
const claims = tokenService.getClaims();

if (claims) {
  console.log('User ID:', claims.user_id);
  console.log('Email:', claims.email);
}
```

#### `getRoles(): TokenRole[]`

Gets the current user's roles.

```typescript
const roles = tokenService.getRoles();

console.log('User roles:', roles); // ['user', 'admin', etc.]
```

### Role Checking

#### `userHasRole(role: string): boolean`

Checks if the user has a specific role.

```typescript
if (tokenService.userHasRole('admin')) {
  // Show admin UI
}
```

#### `userHasAnyRole(roles: string[]): boolean`

Checks if the user has any of the specified roles.

```typescript
if (tokenService.userHasAnyRole(['admin', 'moderator'])) {
  // Show management UI
}
```

#### `userHasAllRoles(roles: string[]): boolean`

Checks if the user has all of the specified roles.

```typescript
if (tokenService.userHasAllRoles(['admin', 'verified'])) {
  // Show privileged admin UI
}
```

### Permission Checking

#### `userHasPermission(permission: string): boolean`

Checks if the user has a specific permission.

```typescript
if (tokenService.userHasPermission('users:edit')) {
  // Allow user editing
}
```

#### `getUserPermissions(): string[]`

Gets all permissions available to the user.

```typescript
const permissions = tokenService.getUserPermissions();

console.log('User can:', permissions);
// ['users:read', 'users:edit', 'posts:create', etc.]
```

### Authentication Status

#### `isAuthenticated(): boolean`

Checks if the user is currently authenticated.

```typescript
if (tokenService.isAuthenticated()) {
  // User is logged in
} else {
  // Redirect to login
}
```

#### `userHasAttribute(attribute: string): boolean`

Checks if the user has a specific boolean attribute.

```typescript
if (tokenService.userHasAttribute('emailVerified')) {
  // Email is verified
}
```

## Token Lifecycle

### 1. Initialization

On app startup, the service:
1. Checks for existing stored tokens
2. Validates token expiration
3. Decodes and extracts claims
4. Updates the token store
5. Schedules automatic refresh
6. Sets up Firebase auth listener

### 2. Token Acquisition

When a user signs in:
1. Firebase Auth provides an ID token
2. Token service processes the token
3. Token is decoded and claims extracted
4. Roles and permissions are determined
5. Token is stored securely
6. Store is updated with new state
7. Refresh timer is scheduled

### 3. Token Refresh

Tokens are automatically refreshed:
- Scheduled at 50% of token lifetime
- Minimum 5 minutes, maximum 50 minutes
- Can be manually triggered
- Prevents concurrent refresh attempts
- Updates token and reschedules next refresh

### 4. Token Expiration

When a token expires:
1. API requests will fail with auth error
2. Token service detects expiration
3. Automatic refresh is triggered
4. Request is retried with new token
5. User session continues seamlessly

### 5. Token Clearing

When a user signs out:
1. Tokens are removed from storage
2. Refresh timer is cancelled
3. Store is reset to unauthenticated state
4. Auth listeners are notified

## Integration with Auth Service

The Token Service works closely with the Auth Service:

```typescript
// Auth service calls token service after sign-in
const idToken = await firebaseUser.getIdToken();
await tokenService.processToken(idToken);

// Auth service calls token service during sign-out
tokenService.clearTokenState();
```

## Token Validation

### Validation Checks

The service validates tokens by checking:
1. Token format (valid JWT structure)
2. Expiration time (`exp` claim)
3. Issue time (`iat` claim)
4. Signature (via Firebase)

### Expiration Handling

```typescript
import { isTokenValid, isTokenExpired } from '$lib/utils/tokens';

const token = tokenService.getToken();

if (!isTokenValid(token)) {
  // Token is invalid or expired
  await tokenService.refreshToken();
}
```

## Automatic Refresh Scheduling

The service automatically schedules token refreshes:

```typescript
// Refresh scheduling logic
const now = Math.floor(Date.now() / 1000);
const expiration = decoded.exp;
const timeUntilExp = expiration - now;

// Refresh at 50% of remaining time
const refreshDelay = Math.max(
  Math.min(timeUntilExp * 0.5, 50 * 60), // Max 50 minutes
  5 * 60                                  // Min 5 minutes
) * 1000;

// Schedule refresh
setTimeout(() => refreshToken(), refreshDelay);
```

## Usage Examples

### Component Integration

```typescript
<script lang="ts">
  import { tokenService } from '$lib/services/token/token.service';
  import { tokenStore } from '$lib/stores/token.store';

  $: isAdmin = tokenService.userHasRole('admin');
  $: canEditUsers = tokenService.userHasPermission('users:edit');
  $: claims = $tokenStore.claims;
</script>

{#if isAdmin}
  <AdminPanel />
{/if}

{#if canEditUsers}
  <button on:click={editUser}>Edit User</button>
{/if}

{#if claims}
  <p>Welcome, {claims.email}</p>
{/if}
```

### Route Protection

```typescript
import { tokenService } from '$lib/services/token/token.service';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // Check authentication
  if (!tokenService.isAuthenticated()) {
    throw redirect(302, '/login');
  }

  // Check authorization
  if (!tokenService.userHasRole('admin')) {
    throw redirect(302, '/unauthorized');
  }

  return {
    user: tokenService.getClaims()
  };
};
```

### Permission-Based UI

```typescript
<script lang="ts">
  import { tokenService } from '$lib/services/token/token.service';

  const permissions = tokenService.getUserPermissions();

  function canPerformAction(action: string): boolean {
    return permissions.includes(action);
  }
</script>

<nav>
  {#if canPerformAction('users:read')}
    <a href="/users">Users</a>
  {/if}

  {#if canPerformAction('posts:create')}
    <a href="/posts/new">New Post</a>
  {/if}

  {#if canPerformAction('admin:dashboard')}
    <a href="/admin">Admin</a>
  {/if}
</nav>
```

### Manual Token Refresh

```typescript
async function refreshUserToken() {
  const result = await tokenService.refreshToken();

  if (result.success) {
    if (result.changed) {
      console.log('Token updated');
      // Token was actually refreshed
    } else {
      console.log('Token still valid');
    }
  } else {
    console.error('Refresh failed:', result.error);
    // Handle refresh failure (e.g., redirect to login)
  }
}
```

### Reactive Token State

```typescript
<script lang="ts">
  import { tokenStore } from '$lib/stores/token.store';
  import { tokenService } from '$lib/services/token/token.service';

  $: authenticated = $tokenStore.isAuthenticated;
  $: roles = $tokenStore.roles;
  $: claims = $tokenStore.claims;

  $: if (authenticated && !tokenService.userHasRole('verified')) {
    // Show email verification prompt
  }
</script>
```

## Token Store Integration

The service updates a Svelte store for reactive UI updates:

```typescript
interface TokenState {
  token: string | null;
  decodedToken: DecodedToken | null;
  claims: FirebaseUserClaims | null;
  roles: TokenRole[];
  isAuthenticated: boolean;
  isInitialized: boolean;
  isInitializing: boolean;
  lastUpdated: number;
  error: AppError | null;
}
```

Subscribe to store changes:

```typescript
import { tokenStore } from '$lib/stores/token.store';

tokenStore.subscribe(state => {
  if (state.isAuthenticated) {
    console.log('User authenticated:', state.claims?.email);
  }
});
```

## Role-Based Access Control (RBAC)

### Role Structure

Roles are stored in token claims:

```typescript
{
  roles: ['user', 'admin'],           // Direct roles
  customClaims: {
    roles: ['moderator']              // Custom claim roles
  }
}
```

### Permission Mapping

Permissions are derived from roles using the RBAC utility:

```typescript
const permissions = rbacUtil.getAllPermissions(claims);
// Based on role mappings in RBAC configuration
```

## Best Practices

1. **Initialize Early**: Call `initialize()` in app startup
2. **Use Reactive Stores**: Subscribe to `tokenStore` for reactive updates
3. **Check Permissions**: Use permission checks rather than role checks when possible
4. **Handle Refresh Failures**: Implement fallback for refresh failures
5. **Secure Storage**: Tokens are automatically stored securely
6. **Don't Store Tokens Manually**: Let the service manage storage
7. **Clear on Logout**: Always call `clearTokenState()` on logout

## Error Handling

The service handles various error scenarios:

- **Invalid Token**: Returns null/false from validation methods
- **Expired Token**: Automatically triggers refresh
- **Refresh Failure**: Updates store with error state
- **Storage Failure**: Logs error but continues operation
- **Firebase Errors**: Propagates to caller for handling

## Configuration

Token refresh timing can be adjusted:

```typescript
// In token.service.ts
const refreshDelay = Math.max(
  Math.min(timeUntilExp * 0.5, 50 * 60), // Adjust max delay
  5 * 60                                  // Adjust min delay
);
```

Storage options are configured via:

```typescript
// In secure-storage.constants.ts
export const AUTH_NAMESPACE = 'auth';
export const AUTH_TOKEN_TTL = 3600; // 1 hour
```

## Related Services

- **Auth Service**: Handles user authentication
- **API Service**: Uses tokens for authenticated requests
- **RBAC Utility**: Manages role and permission logic
- **Secure Storage**: Stores tokens securely
- **Logger Service**: Logs token operations

## Type Definitions

See `src/lib/types/token.types.ts` for complete type definitions.
