# Auth Store

## Overview
Manages authentication state throughout the application, including user authentication status, authentication methods, loading states, and error handling. This is the central store for all authentication-related state management.

## Store Location
`src/lib/stores/auth.store.ts`

## State Structure

```typescript
interface AuthState {
  isInitialized: boolean;      // Whether the auth service is initialized
  isInitializing: boolean;      // Whether the auth service is initializing
  isAuthenticated: boolean;     // Whether the user is authenticated
  isLoading: boolean;           // Whether authentication state is being loaded
  user: User | null;            // The current Firebase user if authenticated
  claims: FirebaseUserClaims | null; // User claims extracted from token
  authMethod: AuthMethod;       // Authentication method used
  lastAuthenticated: number | null; // Timestamp when the user last authenticated
  error: AppError | null;       // Any error that occurred during authentication
}

type AuthMethod = 'emailLink' | 'phoneNumber' | 'federation' | null;
```

## Key Methods

### Reading State
- `safeGet()` - Safely retrieve current auth state with error handling
- `getUser()` - Get the current Firebase user
- `getClaims()` - Get user claims from token
- `isAuthenticated()` - Check if user is authenticated
- `isLoading()` - Check if auth is in loading state
- `hasRole(role: string)` - Check if user has a specific role

### Modifying State
- `reset()` - Reset store to initial state

## Usage Examples

### Subscribe to Auth State
```typescript
import { authStore } from '$lib/stores/auth.store';

authStore.subscribe($auth => {
  if ($auth.isAuthenticated) {
    console.log('User is authenticated:', $auth.user);
  }
});
```

### Check Authentication Status
```typescript
import { authStore } from '$lib/stores/auth.store';

const isLoggedIn = authStore.isAuthenticated();
const currentUser = authStore.getUser();
```

### Check User Roles
```typescript
import { authStore } from '$lib/stores/auth.store';

if (authStore.hasRole('admin')) {
  // Show admin features
}
```

### Update Auth State
```typescript
import { authStore } from '$lib/stores/auth.store';

authStore.update(state => ({
  ...state,
  isAuthenticated: true,
  user: firebaseUser,
  claims: userClaims,
  authMethod: 'emailLink',
  lastAuthenticated: Date.now()
}));
```

### Reset on Logout
```typescript
import { authStore } from '$lib/stores/auth.store';

authStore.reset();
```

## Integration Points

- **Auth Service** (`src/lib/services/auth.service.ts`) - Updates store during authentication flows
- **Token Store** (`src/lib/stores/token.store.ts`) - Works in tandem for token management
- **Tab Sync Store** (`src/lib/stores/tab-sync.store.ts`) - Synchronizes auth state across browser tabs
- **Protected Routes** - Guards check `isAuthenticated` state
- **Firebase Auth** - User object comes from Firebase Authentication

## State Flow

1. **Initialization**: `isInitializing` → `isInitialized`
2. **Login**: `isLoading` → `isAuthenticated` + user data populated
3. **Token Refresh**: Claims and user data updated
4. **Logout**: All state reset via `reset()`
5. **Error**: `error` field populated, other state preserved or cleared

## Best Practices

1. Always use `safeGet()` when reading state outside of reactive contexts
2. Check `isLoading()` before assuming auth state is stable
3. Use `hasRole()` for role-based access control
4. Reset store on logout to prevent state leaks
5. Subscribe to store in components for reactive updates
