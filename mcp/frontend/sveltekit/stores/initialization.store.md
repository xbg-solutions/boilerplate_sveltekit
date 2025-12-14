# Initialization Store

## Overview
Manages application initialization state, tracking the initialization status of individual services and overall application readiness. Provides centralized visibility into the initialization process.

## Store Location
`src/lib/stores/initialization.store.ts`

## State Structure

```typescript
interface InitializationState {
  isInitialized: boolean;       // Whether all services are initialized
  isInitializing: boolean;       // Whether initialization is in progress
  error: AppError | null;        // Any error that occurred during initialization
  services: {
    app: boolean;                // App service initialization status
    auth: boolean;               // Auth service initialization status
    // Additional services can be added
  }
}
```

## Usage Examples

### Subscribe to Initialization State
```typescript
import { initializationStore } from '$lib/stores/initialization.store';

initializationStore.subscribe($init => {
  console.log('App initialized:', $init.isInitialized);
  console.log('Auth ready:', $init.services.auth);
  console.log('App ready:', $init.services.app);
});
```

### Start Initialization
```typescript
import { initializationStore } from '$lib/stores/initialization.store';

initializationStore.update(state => ({
  ...state,
  isInitializing: true,
  error: null
}));
```

### Mark Service as Initialized
```typescript
import { initializationStore } from '$lib/stores/initialization.store';

// Mark auth service as initialized
initializationStore.update(state => ({
  ...state,
  services: {
    ...state.services,
    auth: true
  }
}));
```

### Complete Initialization
```typescript
import { initializationStore } from '$lib/stores/initialization.store';

initializationStore.update(state => ({
  ...state,
  isInitialized: true,
  isInitializing: false,
  services: {
    app: true,
    auth: true
  }
}));
```

### Handle Initialization Error
```typescript
import { initializationStore } from '$lib/stores/initialization.store';
import { createAppError } from '$lib/utils/error-handler';

initializationStore.update(state => ({
  ...state,
  isInitializing: false,
  isInitialized: false,
  error: createAppError('Failed to initialize services', 'INIT_ERROR')
}));
```

### Check All Services Ready
```typescript
import { initializationStore } from '$lib/stores/initialization.store';
import { get } from 'svelte/store';

const $init = get(initializationStore);
const allServicesReady = Object.values($init.services).every(status => status);

if (allServicesReady) {
  console.log('All services initialized');
}
```

### Wait for Initialization
```typescript
import { initializationStore } from '$lib/stores/initialization.store';
import { get } from 'svelte/store';

async function waitForInit(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    const unsubscribe = initializationStore.subscribe($init => {
      if ($init.isInitialized) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
```

## Integration Points

- **App Initialization** (`src/lib/services/initialization.service.ts`) - Main initialization orchestrator
- **Auth Service** - Reports auth initialization status
- **Loading Store** - May track initialization loading states
- **Route Guards** - Wait for initialization before rendering protected routes
- **Layout Components** - Show loading screen while initializing

## Initialization Flow

1. **Start**: `isInitializing` = true
2. **Initialize Services**: Each service updates its status in `services`
3. **All Services Ready**: Check if all services are true
4. **Complete**: `isInitialized` = true, `isInitializing` = false
5. **Error**: Set `error`, clear `isInitializing`

## Service Status Tracking

```typescript
import { initializationStore } from '$lib/stores/initialization.store';
import { derived } from 'svelte/store';

// Derived store for service statuses
const serviceStatuses = derived(initializationStore, $init => ({
  app: $init.services.app ? 'ready' : 'pending',
  auth: $init.services.auth ? 'ready' : 'pending',
  overall: $init.isInitialized ? 'ready' :
           $init.isInitializing ? 'initializing' : 'pending'
}));
```

## Error Handling

```typescript
import { initializationStore } from '$lib/stores/initialization.store';

initializationStore.subscribe($init => {
  if ($init.error) {
    console.error('Initialization error:', $init.error);
    // Show error UI or retry initialization
  }
});
```

## Retry Logic

```typescript
import { initializationStore } from '$lib/stores/initialization.store';

async function retryInitialization(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Reset error
      initializationStore.update(state => ({
        ...state,
        error: null,
        isInitializing: true
      }));

      // Attempt initialization
      await initializeApp();
      break;
    } catch (error) {
      if (attempt === maxAttempts) {
        initializationStore.update(state => ({
          ...state,
          error: createAppError('Initialization failed after retries'),
          isInitializing: false
        }));
      }
    }
  }
}
```

## Best Practices

1. Always set `isInitializing` to true before starting initialization
2. Update individual service statuses as they complete
3. Only set `isInitialized` when ALL services are ready
4. Clear `isInitializing` on completion or error
5. Provide detailed error information in `error` field
6. Wait for initialization before rendering protected content
7. Show appropriate loading UI while `isInitializing` is true
8. Implement retry logic for transient initialization failures
