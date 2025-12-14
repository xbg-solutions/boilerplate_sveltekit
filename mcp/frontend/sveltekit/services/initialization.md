# Initialization Service

## Overview

The Initialization Service provides centralized application startup orchestration, managing the initialization sequence for Firebase App, Firebase Auth, and the Tab Sync service. It ensures proper initialization order, tracks initialization state, and handles errors during startup.

## Location

- **Service**: `/src/lib/services/initialization/initialization.service.ts`
- **Store**: `/src/lib/stores/initialization.store.ts`
- **Export**: `/src/lib/services/initialization/index.ts`

## Service Coordination

The service initializes components in this sequence:

1. **Firebase App** - Initializes Firebase SDK or uses existing instance
2. **Firebase Auth** - Configures authentication, optionally connects to emulator
3. **Tab Sync** - Sets up cross-tab communication (non-critical)

Publishes events during initialization:
- `app:initialized` - When initialization completes
- `app:initialization-failed` - When initialization fails

## Key Methods

### initialize(options)

Initializes the application with Firebase configuration.

```typescript
await initializationService.initialize({
  firebaseConfig: {
    apiKey: "...",
    authDomain: "...",
    projectId: "..."
  },
  useEmulators: false // Set to true for local development
});
```

**Parameters**:
- `firebaseConfig` (required) - Firebase configuration object
- `useEmulators` (optional) - Whether to use Firebase emulators (default: false)

**Behavior**:
- Skips if already initializing or initialized
- Sets `isInitializing` flag during process
- Updates store with service initialization status
- Publishes initialization events
- Handles errors and updates store with error state

### whenInitialized()

Returns a promise that resolves when initialization is complete.

```typescript
// Wait for initialization
await initializationService.whenInitialized();

// Now safe to use services
const user = authService.getCurrentUser();
```

**Returns**: Promise that resolves when initialized or rejects if initialization fails

### reset()

Resets the initialization state. Useful for testing or recovering from failures.

```typescript
initializationService.reset();
```

### getApp()

Returns the initialized Firebase app instance.

```typescript
const app = initializationService.getApp();
```

**Returns**: FirebaseApp instance or null if not initialized

## Store Structure

The `initializationStore` tracks initialization state:

```typescript
{
  isInitialized: boolean,      // Overall initialization status
  isInitializing: boolean,      // Currently initializing
  error: AppError | null,       // Initialization error if any
  services: {
    app: boolean,               // Firebase App initialized
    auth: boolean               // Firebase Auth initialized
  }
}
```

## Usage Examples

### Basic Initialization

```typescript
import { initializationService } from '$lib/services/initialization';
import { browser } from '$app/environment';

if (browser) {
  try {
    await initializationService.initialize({
      firebaseConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
      }
    });
    console.log('App initialized');
  } catch (error) {
    console.error('Initialization failed', error);
  }
}
```

### With Emulators (Development)

```typescript
await initializationService.initialize({
  firebaseConfig: config,
  useEmulators: import.meta.env.DEV
});
```

### Waiting for Initialization

```typescript
// In a component or service that depends on initialization
import { initializationService } from '$lib/services/initialization';

async function loadUserData() {
  // Ensure app is initialized first
  await initializationService.whenInitialized();

  // Now safe to use auth service
  const user = authService.getCurrentUser();
  return fetchUserData(user.uid);
}
```

### Monitoring Initialization State

```typescript
import { initializationStore } from '$lib/services/initialization';

// Subscribe to initialization state
initializationStore.subscribe(state => {
  if (state.isInitialized) {
    console.log('App ready');
  } else if (state.error) {
    console.error('Initialization failed', state.error);
  }
});
```

### Using Helper Function

```typescript
import { getInitializationState } from '$lib/services/initialization';

const state = getInitializationState();
console.log('Initialized:', state.isInitialized);
console.log('Services:', state.services);
```

## Error Handling

Initialization errors are:
- Normalized using the error handler utility
- Stored in the initialization store
- Published via the event system
- Logged with context information
- Re-thrown for upstream handling

## Integration Notes

- **SSR Safe**: Skips initialization when not in browser context
- **Idempotent**: Safe to call `initialize()` multiple times
- **Event Driven**: Publishes events for other services to react
- **Tab Sync**: Non-critical service, continues on failure
- **Singleton**: Single instance shared across the application
