# Authentication Service

**Location**: `src/lib/services/auth/auth.service.ts`

## Overview

The Authentication Service is the core service for managing authentication state and operations in the application. It provides a unified interface for Firebase Authentication with support for multiple authentication methods, token management, and real-time auth state synchronization.

## Features

- **Firebase Authentication Integration**: Seamless integration with Firebase Auth
- **Multiple Auth Methods**: Email link and phone number authentication
- **Token Management**: Automatic token acquisition and refresh via token service
- **Real-time State**: Synchronized auth state across the application
- **Event-Driven**: Publishes events for auth state changes
- **Claims Extraction**: Automatic extraction of user claims and custom attributes
- **Role-Based Access**: Built-in role checking and permissions

## Architecture

```
User Action
     ↓
Auth Service
     ├─→ Firebase Auth (sign in/out)
     ├─→ Token Service (token management)
     ├─→ Auth Store (state management)
     ├─→ Event Bus (publish auth events)
     └─→ Logger Service (logging)
```

## Core Methods

### Initialization

#### `initialize(): Promise<void>`

Initializes the authentication service.

**What it does:**
1. Checks for existing authenticated user
2. Retrieves and processes ID token
3. Extracts claims and custom attributes
4. Sets up auth state listener
5. Registers event listeners

**Usage:**
```typescript
import { authService } from '$lib/services/auth';

// Initialize during app startup
await authService.initialize();
```

### Email Link Authentication

#### `sendEmailLink(email: string, options?: EmailLinkOptions): Promise<AuthResult>`

Sends an authentication link to the specified email address.

**Parameters:**
- `email`: Email address to send the link to
- `options`: Optional configuration (action URL, continue URL, etc.)

**Returns:** `Promise<AuthResult>` with success status

**Usage:**
```typescript
const result = await authService.sendEmailLink('user@example.com', {
  url: 'https://yourapp.com/verify',
  handleCodeInApp: true
});

if (result.success) {
  console.log('Email sent successfully');
}
```

**User Flow:**
1. User enters email
2. System sends magic link to email
3. User clicks link in email
4. System verifies link and authenticates user

#### `verifyEmailLink(options?: EmailLinkVerifyOptions): Promise<AuthResult>`

Verifies an email authentication link and signs the user in.

**Parameters:**
- `options.returnUrl`: URL to redirect to after successful verification (optional)

**Returns:** `Promise<AuthResult>` with user and authentication details

**Usage:**
```typescript
// In your verification page (+page.svelte)
import { onMount } from 'svelte';
import { authService } from '$lib/services/auth';

onMount(async () => {
  const result = await authService.verifyEmailLink({
    returnUrl: '/dashboard'
  });

  if (result.success) {
    // User is now authenticated
    console.log('Verification successful');
  }
});
```

### Phone Authentication

#### `sendPhoneCode(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<{ verificationId: string }>`

Sends a verification code to the specified phone number.

**Parameters:**
- `phoneNumber`: Phone number in E.164 format (e.g., +1234567890)
- `recaptchaVerifier`: reCAPTCHA verifier instance

**Returns:** Object with `verificationId` needed for code verification

**Usage:**
```typescript
import { RecaptchaVerifier } from 'firebase/auth';
import { authService } from '$lib/services/auth';

// Setup reCAPTCHA
const recaptchaVerifier = new RecaptchaVerifier(
  'recaptcha-container',
  { size: 'normal' },
  auth
);

// Send code
const { verificationId } = await authService.sendPhoneCode(
  '+1234567890',
  recaptchaVerifier
);

// Store verificationId for next step
```

#### `verifyPhoneCode(verificationCode: string, verificationId: string): Promise<AuthResult>`

Verifies a phone verification code and signs the user in.

**Parameters:**
- `verificationCode`: 6-digit code received via SMS
- `verificationId`: Verification ID from `sendPhoneCode`

**Returns:** `Promise<AuthResult>` with authentication result

**Usage:**
```typescript
const result = await authService.verifyPhoneCode(
  '123456', // Code from SMS
  verificationId // From previous step
);

if (result.success) {
  // User is now authenticated
  console.log('Phone verification successful');
}
```

### User State

#### `isAuthenticated(): boolean`

Checks if a user is currently authenticated.

**Returns:** `true` if user is authenticated

**Usage:**
```typescript
if (authService.isAuthenticated()) {
  // User is logged in
} else {
  // User is not logged in
}
```

#### `getCurrentUser(): FirebaseUser | null`

Gets the current authenticated user object.

**Returns:** Firebase User object or null

**Usage:**
```typescript
const user = authService.getCurrentUser();
if (user) {
  console.log('User ID:', user.uid);
  console.log('Email:', user.email);
  console.log('Phone:', user.phoneNumber);
}
```

#### `getUserClaims(): FirebaseUserClaims | null`

Gets the current user's claims (including custom claims).

**Returns:** Claims object or null

**Usage:**
```typescript
const claims = authService.getUserClaims();
if (claims) {
  console.log('Roles:', claims.roles);
  console.log('Verified:', claims.emailVerified);
  console.log('Custom attrs:', claims);
}
```

### Role & Permission Checking

#### `userHasRole(role: string): boolean`

Checks if the current user has a specific role.

**Parameters:**
- `role`: Role name to check

**Returns:** `true` if user has the role

**Usage:**
```typescript
if (authService.userHasRole('admin')) {
  // Show admin features
}
```

#### `userHasAnyRole(roles: string[]): boolean`

Checks if the current user has any of the specified roles.

**Parameters:**
- `roles`: Array of role names

**Returns:** `true` if user has at least one of the roles

**Usage:**
```typescript
if (authService.userHasAnyRole(['admin', 'moderator'])) {
  // Show moderation features
}
```

### Logout

#### `logout(): Promise<void>`

Logs out the current user.

**What it does:**
1. Clears stored email (if any)
2. Publishes logout event
3. Signs out from Firebase
4. Clears auth store
5. Redirects to home page

**Usage:**
```typescript
await authService.logout();
// User is now logged out and redirected
```

### Cleanup

#### `destroy(): void`

Destroys the auth service instance and cleans up resources.

**What it does:**
- Unsubscribes from auth state changes
- Unregisters event listeners
- Cleans up resources

**Usage:**
```typescript
// Call during app shutdown
authService.destroy();
```

## Store Integration

The auth service maintains state in the `authStore`:

```typescript
import { authStore } from '$lib/stores/auth.store';

// Subscribe to auth state
authStore.subscribe(state => {
  console.log('Is authenticated:', state.isAuthenticated);
  console.log('User:', state.user);
  console.log('Claims:', state.claims);
  console.log('Auth method:', state.authMethod);
  console.log('Is loading:', state.isLoading);
  console.log('Error:', state.error);
});
```

## Events

The auth service publishes the following events:

### `AUTH_EVENTS.STATE_CHANGED`

Published when authentication state changes.

**Payload:**
```typescript
{
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  claims: FirebaseUserClaims | null;
  authMethod: 'emailLink' | 'phoneNumber' | 'federation' | null;
}
```

### `AUTH_EVENTS.LOGIN_SUCCESS`

Published when user successfully logs in.

**Payload:**
```typescript
{
  user: FirebaseUser;
  claims: FirebaseUserClaims;
  method: 'emailLink' | 'phoneNumber' | 'federation';
}
```

### `AUTH_EVENTS.LOGOUT`

Published when user initiates logout.

**Payload:** `{}`

## Error Handling

The auth service uses normalized errors from the error handler utility:

```typescript
try {
  await authService.sendEmailLink('user@example.com');
} catch (error) {
  // Error is normalized and logged
  console.error('Auth error:', error.message);
  console.error('Category:', error.category);
  console.error('User message:', error.userMessage);
}
```

## Common Patterns

### Protecting Routes

Use with `route-handler` utility:

```typescript
// +page.ts
import { routeHandler } from '$lib/utils/route-handler';

export const load = routeHandler.createLoadFunction({
  requireAuth: true,
  requiredRoles: ['user'],
  redirectTo: '/login'
});
```

### Reactive Authentication UI

```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth.store';
  import { authService } from '$lib/services/auth';

  async function handleLogout() {
    await authService.logout();
  }
</script>

{#if $authStore.isAuthenticated}
  <div>
    <p>Welcome, {$authStore.user?.email}!</p>
    <button on:click={handleLogout}>Logout</button>
  </div>
{:else}
  <a href="/login">Login</a>
{/if}
```

### Custom Claims Integration

```typescript
// After login, claims are automatically extracted
const claims = authService.getUserClaims();

if (claims) {
  // Standard claims
  console.log('Email verified:', claims.emailVerified);

  // Custom claims (set via Firebase Admin SDK)
  console.log('User roles:', claims.roles);
  console.log('Subscription tier:', claims.subscriptionTier);
  console.log('Premium user:', claims.isPremium);
}
```

## Safe Wrappers

The service exports safe wrappers that never throw:

```typescript
import {
  safeSendEmailLink,
  safeVerifyEmailLink,
  safeSendPhoneCode,
  safeVerifyPhoneCode,
  safeLogout
} from '$lib/services/auth';

// These return { success, data, error } instead of throwing
const result = await safeSendEmailLink('user@example.com');
if (!result.success) {
  console.error('Failed:', result.error);
} else {
  console.log('Success:', result.data);
}
```

## Integration with Token Service

The auth service automatically integrates with the token service:

1. **On Sign In**: Gets ID token from Firebase and passes to token service
2. **Token Processing**: Token service decodes, validates, and stores token
3. **Claims Extraction**: Both services extract and normalize claims
4. **Refresh**: Token service handles automatic token refresh

```
User Signs In
     ↓
Auth Service → Get ID Token from Firebase
     ↓
Auth Service → Pass token to Token Service
     ↓
Token Service → Decode, validate, store token
     ↓
Token Service → Extract claims and roles
     ↓
Both Services → Update respective stores
```

## Testing

The auth service is designed for easy testing:

```typescript
import { describe, test, expect, vi } from 'vitest';
import { authService } from '$lib/services/auth';

describe('Auth Service', () => {
  test('sends email link', async () => {
    const result = await authService.sendEmailLink('test@example.com');
    expect(result.success).toBe(true);
  });

  test('checks authentication status', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });
});
```

## Dependencies

- **Firebase Auth**: Core authentication provider
- **Token Service**: Token management and validation
- **Auth Store**: State management
- **Event Bus**: Event publishing
- **Logger Service**: Contextual logging
- **Error Handler**: Error normalization and handling
- **Firebase Util**: Safe Firebase operations

## Configuration

Authentication configuration is managed in:

- `src/lib/config/app.config.ts` - Firebase config
- `src/lib/constants/auth.constants.ts` - Auth constants and routes

## Related Documentation

- [Token Service](./token.md)
- [Route Handler Utility](../utils/route-handler.md)
- [Auth Store](../stores/auth.md)
- [RBAC Utility](../utils/rbac.md)
- [Firebase Utility](../utils/firebase.md)

---

**Built for agentic development by [XBG Solutions](https://xbg.solutions)**
