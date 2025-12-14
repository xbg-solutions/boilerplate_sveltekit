# Firebase Utility

## Overview

Firebase initialization and integration utility focused on authentication. Handles Firebase setup, provides abstractions for Firebase services, and integrates with error handler and logger.

**Location:** `src/lib/utils/firebase.ts`

## Key Features

- Automatic Firebase initialization
- Environment-based configuration
- Firebase Auth emulator support
- Auth persistence management
- Safe async wrappers
- Custom error classes
- User-friendly error messages

## Key Functions

### initializeFirebase

Initializes Firebase if not already initialized.

```typescript
async function initializeFirebase(): Promise<FirebaseState>
```

**Usage:**
```typescript
const state = await initializeFirebase();
if (state.error) {
  console.error('Firebase init failed:', state.error);
}
```

### getFirebaseAuth

Gets the Firebase auth instance.

```typescript
async function getFirebaseAuth(): Promise<Auth>
```

**Usage:**
```typescript
const auth = await getFirebaseAuth();
const user = auth.currentUser;
```

### signOutUser

Signs out the current user.

```typescript
async function signOutUser(): Promise<void>
```

**Usage:**
```typescript
await signOutUser();
```

### getCurrentUser

Gets the current user.

```typescript
async function getCurrentUser(): Promise<User | null>
```

**Usage:**
```typescript
const user = await getCurrentUser();
if (user) {
  console.log('Logged in as:', user.email);
}
```

### subscribeToAuthChanges

Subscribes to auth state changes.

```typescript
async function subscribeToAuthChanges(
  callback: (user: User | null) => void
): Promise<() => void>
```

**Usage:**
```typescript
const unsubscribe = await subscribeToAuthChanges((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// Later: unsubscribe();
```

### processFirebaseError

Converts Firebase errors to user-friendly messages.

```typescript
function processFirebaseError(
  error: unknown,
  fallbackMessage?: string,
  options?: FirebaseErrorOptions
): FirebaseError
```

**Usage:**
```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  const friendlyError = processFirebaseError(
    error,
    'Login failed',
    { action: 'auth/login' }
  );
  console.log(friendlyError.userMessage); // User-friendly message
}
```

### Safe Wrappers

Safe versions that return result objects:

```typescript
const { success, data, error } = await safeGetFirebaseAuth();
const { success, data, error } = await safeSignOutUser();
const { success, data, error } = await safeGetCurrentUser();
const { success, data, error } = await safeSubscribeToAuthChanges(callback);
```

## Configuration

Set Firebase config in environment variables:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Optional: Emulator
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
```

## Error Messages

Provides user-friendly messages for common Firebase errors:

```typescript
// Firebase error codes mapped to friendly messages
'auth/email-already-in-use' → 'This email address is already in use.'
'auth/wrong-password' → 'The password is incorrect. Please try again.'
'auth/user-not-found' → 'No account was found with this email address.'
'auth/too-many-requests' → 'Too many unsuccessful login attempts...'
```

## Common Usage Patterns

### Initialize in App

```typescript
// +layout.svelte
import { onMount } from 'svelte';
import { initializeFirebase } from '$lib/utils/firebase';

onMount(async () => {
  await initializeFirebase();
});
```

### Listen to Auth Changes

```typescript
import { subscribeToAuthChanges } from '$lib/utils/firebase';
import { authStore } from '$lib/stores/auth';

onMount(async () => {
  const unsubscribe = await subscribeToAuthChanges((user) => {
    authStore.set(user);
  });
  
  return unsubscribe;
});
```

### Safe Authentication

```typescript
const { success, error } = await safeSignOutUser();
if (!success) {
  showToast('Failed to sign out: ' + error?.userMessage);
}
```

## Integration Points

- **Logger Service**: All operations logged
- **Error Handler**: Automatic error processing
- **Auth Service**: Primary consumer
- **Token Service**: Gets Firebase ID tokens

## Best Practices

1. **Initialize early** - In root layout
2. **Use safe wrappers** - For optional operations
3. **Handle errors** - Process with processFirebaseError
4. **Set persistence** - Automatically set to LOCAL
5. **Use emulator** - In development
6. **Subscribe once** - Avoid multiple auth listeners
7. **Unsubscribe** - Clean up listeners
