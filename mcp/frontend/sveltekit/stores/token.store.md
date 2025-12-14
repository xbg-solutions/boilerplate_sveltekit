# Token Store

## Overview
Manages authentication token state including token storage, decoded token information, user claims, roles, and authentication status tracking. Works closely with the auth store to maintain token-based authentication.

## Store Location
`src/lib/stores/token.store.ts`

## State Structure

```typescript
interface TokenState {
  isInitialized: boolean;       // Whether the token service is initialized
  isInitializing: boolean;       // Whether the token service is initializing
  token: string | null;          // The current token
  decodedToken: DecodedToken | null; // Decoded token information
  claims: FirebaseUserClaims | null; // Extracted user claims
  roles: TokenRole[];            // User roles
  isAuthenticated: boolean;      // Whether the user is authenticated
  lastUpdated: number | null;    // Timestamp when the token was last updated
  error: AppError | null;        // Any error that occurred during token operations
}
```

## Key Fields

- **token** - Raw JWT token string
- **decodedToken** - Parsed token payload with expiration, issuer, etc.
- **claims** - User-specific claims (custom data)
- **roles** - Array of user roles for RBAC
- **lastUpdated** - Track when token was last refreshed

## Usage Examples

### Subscribe to Token State
```typescript
import { tokenStore } from '$lib/stores/token.store';

tokenStore.subscribe($token => {
  if ($token.isAuthenticated) {
    console.log('Token:', $token.token);
    console.log('Roles:', $token.roles);
  }
});
```

### Update Token
```typescript
import { tokenStore } from '$lib/stores/token.store';

tokenStore.update(state => ({
  ...state,
  token: newToken,
  decodedToken: decodedData,
  claims: extractedClaims,
  roles: extractedRoles,
  isAuthenticated: true,
  lastUpdated: Date.now()
}));
```

### Check Token Validity
```typescript
import { tokenStore } from '$lib/stores/token.store';
import { get } from 'svelte/store';

const $token = get(tokenStore);
if ($token.decodedToken && $token.decodedToken.exp) {
  const isExpired = Date.now() / 1000 > $token.decodedToken.exp;
  console.log('Token expired:', isExpired);
}
```

### Reset Token State
```typescript
import { tokenStore } from '$lib/stores/token.store';

tokenStore.set({
  isInitialized: false,
  isInitializing: false,
  token: null,
  decodedToken: null,
  claims: null,
  roles: [],
  isAuthenticated: false,
  lastUpdated: null,
  error: null
});
```

## Integration Points

- **Auth Store** (`src/lib/stores/auth.store.ts`) - Synchronized with auth state
- **Auth Service** (`src/lib/services/auth.service.ts`) - Updates token on login/refresh
- **API Service** (`src/lib/stores/api.service.ts`) - Uses token for authenticated requests
- **Secure Storage** (`src/lib/stores/secure-storage.ts`) - Token persistence
- **RBAC Store** (`src/lib/stores/rbac.ts`) - Roles extracted from token

## State Flow

1. **Initialization**: `isInitializing` → `isInitialized`
2. **Login**: Token received → decoded → claims/roles extracted → `isAuthenticated` = true
3. **Token Refresh**: New token → update `token`, `decodedToken`, `lastUpdated`
4. **Logout**: All fields reset to initial state
5. **Error**: `error` populated, auth state set to false

## Best Practices

1. Always decode and validate tokens before updating store
2. Check token expiration before making authenticated requests
3. Clear token state completely on logout
4. Use `lastUpdated` to track token freshness
5. Handle token refresh proactively before expiration
6. Store token securely (never in localStorage without encryption)
