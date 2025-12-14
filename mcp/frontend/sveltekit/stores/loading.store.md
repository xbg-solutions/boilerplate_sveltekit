# Loading Store

## Overview
Manages loading states throughout the application with support for nested operations and contextual loading. Tracks both global loading state and context-specific loading states, enabling granular loading UI control.

## Store Location
`src/lib/stores/loading.store.ts`

## State Structure

```typescript
interface LoadingState {
  global: boolean;              // Global loading state
  contexts: Record<string, boolean>; // Loading states for specific contexts
  operations: LoadingOperation[]; // Operation history for debugging
  activeOperations: number;     // Current operation count
}

interface LoadingOperation {
  context: string;              // Context name (e.g., 'auth', 'api', 'form')
  operation: string;            // Operation name (e.g., 'login', 'fetch', 'submit')
  timestamp: number;            // When operation started/ended
  state: 'start' | 'end';      // Operation state
}
```

## Key Methods

### Core Methods
- `startLoading(context?: string, operation?: string)` - Start a loading operation
- `endLoading(context?: string, operation?: string)` - End a loading operation
- `withLoading<T>(fn: () => Promise<T>, context?: string, operation?: string)` - Run function with automatic loading state

### Query Methods
- `forContext(contextName: string)` - Get derived store for a specific context
- `isAnyLoading()` - Check if any operation is loading
- `isContextLoading(context: string)` - Check if specific context is loading
- `resetLoading()` - Reset all loading states

## Usage Examples

### Basic Loading State
```typescript
import { loadingStore } from '$lib/stores/loading.store';

// Start loading
loadingStore.startLoading('auth', 'login');

// Do work...

// End loading
loadingStore.endLoading('auth', 'login');
```

### With Loading Wrapper
```typescript
import { loadingStore } from '$lib/stores/loading.store';

async function fetchData() {
  return await loadingStore.withLoading(
    async () => {
      const response = await fetch('/api/data');
      return await response.json();
    },
    'api',
    'fetchData'
  );
}
```

### Subscribe to Global Loading
```typescript
import { loadingStore } from '$lib/stores/loading.store';

loadingStore.subscribe($loading => {
  if ($loading.global) {
    console.log('Something is loading...');
    console.log('Active operations:', $loading.activeOperations);
  }
});
```

### Context-Specific Loading
```typescript
import { loadingStore } from '$lib/stores/loading.store';

// Get derived store for specific context
const authLoading = loadingStore.forContext('auth');

authLoading.subscribe($isLoading => {
  console.log('Auth loading:', $isLoading);
});
```

### Check Loading State
```typescript
import { loadingStore } from '$lib/stores/loading.store';

if (loadingStore.isAnyLoading()) {
  console.log('Something is loading');
}

if (loadingStore.isContextLoading('auth')) {
  console.log('Auth operations in progress');
}
```

### Reset All Loading
```typescript
import { loadingStore } from '$lib/stores/loading.store';

loadingStore.resetLoading();
```

## Integration Points

- **Auth Service** - Uses 'auth' context for login/logout operations
- **API Service** - Uses 'api' context for network requests
- **Form Components** - Uses 'form' context for submission states
- **Loading Indicators** - Subscribe to show spinners/progress
- **Navigation Guards** - Check loading state before navigation

## Context Examples

Common context names used throughout the application:

- **'global'** - Default context for general loading
- **'auth'** - Authentication operations
- **'api'** - API requests
- **'form'** - Form submissions
- **'data'** - Data fetching
- **'upload'** - File uploads
- **'profile'** - Profile updates

## Operation Tracking

The store maintains an operation history (limited to 100 entries) for debugging:

```typescript
loadingStore.subscribe($loading => {
  console.log('Recent operations:', $loading.operations);
});

// Example output:
// [
//   { context: 'auth', operation: 'login', timestamp: 1234567890, state: 'start' },
//   { context: 'api', operation: 'fetch', timestamp: 1234567891, state: 'start' },
//   { context: 'api', operation: 'fetch', timestamp: 1234567892, state: 'end' },
//   { context: 'auth', operation: 'login', timestamp: 1234567893, state: 'end' }
// ]
```

## Nested Operations

The store handles nested operations correctly:

```typescript
loadingStore.startLoading('api', 'fetch1');
loadingStore.startLoading('api', 'fetch2');

// Both operations active, context still loading
console.log(loadingStore.isContextLoading('api')); // true

loadingStore.endLoading('api', 'fetch1');
// One operation still active
console.log(loadingStore.isContextLoading('api')); // true

loadingStore.endLoading('api', 'fetch2');
// All operations complete
console.log(loadingStore.isContextLoading('api')); // false
```

## Best Practices

1. Always pair `startLoading()` with `endLoading()`
2. Use `withLoading()` for automatic cleanup
3. Use specific context names for granular control
4. Name operations descriptively for debugging
5. Check context-specific loading for targeted UI updates
6. Use global loading for app-wide loading indicators
7. Reset loading state on app initialization or errors
8. Don't forget to end loading operations in error handlers
