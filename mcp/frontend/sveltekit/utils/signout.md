# Signout Utility

## Overview

User signout utility handling Firebase authentication signout, backend token revocation, state cleanup, and redirection.

**Location:** `src/lib/utils/signout.ts`

## Key Functions

### signout
Signs out the current user.

```typescript
await signout({
  skipBackendRevocation: false,
  redirectUrl: '/login',
  skipRedirect: false,
  forceCompleteSignout: false
});
```

### safeSignout
Safe version that returns result object.

```typescript
const { success, error } = await safeSignout(options);
if (!success) {
  console.error('Signout failed:', error);
}
```

## Options

```typescript
interface SignoutOptions {
  skipBackendRevocation?: boolean;
  redirectUrl?: string;
  skipRedirect?: boolean;
  forceCompleteSignout?: boolean;
}
```

## Signout Process

1. Revoke token on backend (if connected)
2. Sign out from Firebase
3. Clear local token state
4. Publish logout event
5. Redirect to login (default) or specified URL

## Common Patterns

### Basic Signout
```svelte
<script>
  import { signout } from '$lib/utils/signout';
  
  async function handleSignout() {
    try {
      await signout();
      // User will be redirected automatically
    } catch (error) {
      showToast('Failed to sign out');
    }
  }
</script>

<button on:click={handleSignout}>Sign Out</button>
```

### Custom Redirect
```typescript
import { signout } from '$lib/utils/signout';

await signout({
  redirectUrl: '/goodbye'
});
```

### Skip Redirect
```typescript
// For programmatic signout without redirect
await signout({
  skipRedirect: true
});

// Handle manually
goto('/login');
```

### Force Complete Signout
```typescript
// Continue even if backend revocation fails
await signout({
  forceCompleteSignout: true
});
```

### Safe Signout with Feedback
```typescript
import { safeSignout } from '$lib/utils/signout';

async function handleSignout() {
  const { success, error } = await safeSignout();
  
  if (success) {
    showToast('Signed out successfully');
  } else {
    showToast(`Signout failed: ${error?.userMessage}`);
  }
}
```

### Skip Backend Revocation
```typescript
// If no backend is connected
await signout({
  skipBackendRevocation: true
});
```

## Backend Integration

The `revokeTokenOnBackend` function is a stub that should be replaced when connecting to a backend:

```typescript
// Replace this implementation
async function revokeTokenOnBackend(): Promise<boolean> {
  // Current: stub implementation
  return true;
  
  // Replace with:
  // const token = await tokenService.getToken();
  // await fetch('/api/auth/revoke', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return true;
}
```

## Integration Points

- **Firebase Utility**: Signs out from Firebase
- **Token Service**: Clears token state
- **Event System**: Publishes logout event
- **Auth Service**: Primary consumer

## Events

Publishes `auth:logout` event when signout completes.

## Best Practices

1. Always provide user feedback
2. Handle errors gracefully
3. Clear sensitive data
4. Redirect to appropriate page
5. Test backend integration
6. Use safe wrapper in UI
7. Force complete if needed

## Error Handling

```typescript
try {
  await signout();
} catch (error) {
  if (error instanceof SignoutError) {
    console.log('Source:', error.source); // 'firebase', 'backend', etc.
    showToast(error.userMessage);
  }
}
```
