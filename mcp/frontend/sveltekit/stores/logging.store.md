# Logging Store

## Overview
Manages logging state and performance timers throughout the application. Tracks whether logging is enabled and maintains active performance timers for debugging and profiling.

## Store Location
`src/lib/stores/logging.store.ts`

## State Structure

```typescript
interface LoggerState {
  enabled: boolean;             // Whether logging is enabled
  timers: Record<string, TimerInfo>; // Active performance timers
}

interface TimerInfo {
  startTime: number;            // When timer started (timestamp)
  label: string;                // Timer label for identification
}
```

## Usage Examples

### Subscribe to Logger State
```typescript
import { loggerStore } from '$lib/stores/logging.store';

loggerStore.subscribe($logger => {
  console.log('Logging enabled:', $logger.enabled);
  console.log('Active timers:', Object.keys($logger.timers));
});
```

### Enable/Disable Logging
```typescript
import { loggerStore } from '$lib/stores/logging.store';

// Enable logging
loggerStore.update(state => ({
  ...state,
  enabled: true
}));

// Disable logging
loggerStore.update(state => ({
  ...state,
  enabled: false
}));
```

### Start Performance Timer
```typescript
import { loggerStore } from '$lib/stores/logging.store';

loggerStore.update(state => ({
  ...state,
  timers: {
    ...state.timers,
    'api-request': {
      startTime: Date.now(),
      label: 'API Request to /users'
    }
  }
}));
```

### End Performance Timer
```typescript
import { loggerStore } from '$lib/stores/logging.store';
import { get } from 'svelte/store';

const $logger = get(loggerStore);
const timer = $logger.timers['api-request'];

if (timer) {
  const duration = Date.now() - timer.startTime;
  console.log(`${timer.label}: ${duration}ms`);

  // Remove timer
  loggerStore.update(state => {
    const { 'api-request': removed, ...remainingTimers } = state.timers;
    return {
      ...state,
      timers: remainingTimers
    };
  });
}
```

### Check if Logging Enabled
```typescript
import { loggerStore } from '$lib/stores/logging.store';
import { get } from 'svelte/store';

const $logger = get(loggerStore);

if ($logger.enabled) {
  console.log('Debug information...');
}
```

### Timer Utility Functions
```typescript
import { loggerStore } from '$lib/stores/logging.store';
import { get } from 'svelte/store';

export function startTimer(id: string, label: string) {
  loggerStore.update(state => ({
    ...state,
    timers: {
      ...state.timers,
      [id]: {
        startTime: Date.now(),
        label
      }
    }
  }));
}

export function endTimer(id: string): number | null {
  const $logger = get(loggerStore);
  const timer = $logger.timers[id];

  if (!timer) return null;

  const duration = Date.now() - timer.startTime;

  if ($logger.enabled) {
    console.log(`[Timer] ${timer.label}: ${duration}ms`);
  }

  // Remove timer
  loggerStore.update(state => {
    const { [id]: removed, ...remainingTimers } = state.timers;
    return {
      ...state,
      timers: remainingTimers
    };
  });

  return duration;
}

export function withTimer<T>(
  id: string,
  label: string,
  fn: () => T
): T {
  startTimer(id, label);
  try {
    return fn();
  } finally {
    endTimer(id);
  }
}

export async function withTimerAsync<T>(
  id: string,
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  startTimer(id, label);
  try {
    return await fn();
  } finally {
    endTimer(id);
  }
}
```

## Integration Points

- **Logging Service** (`src/lib/stores/logging.service.ts`) - Main logging service
- **Performance Monitoring** - Tracks operation durations
- **Debug Tools** - View active timers and logging state
- **Development Mode** - Logging typically enabled in development
- **Production Mode** - Logging typically disabled or limited

## Common Timer IDs

- `'auth:login'` - Login operation timing
- `'api:fetch'` - API request timing
- `'render:component'` - Component render timing
- `'db:query'` - Database query timing
- `'cache:operation'` - Cache operation timing

## Environment-Based Configuration

```typescript
import { loggerStore } from '$lib/stores/logging.store';
import { dev } from '$app/environment';

// Enable logging in development
loggerStore.update(state => ({
  ...state,
  enabled: dev
}));
```

## Performance Profiling Example

```typescript
import { startTimer, endTimer } from './timer-utils';

async function complexOperation() {
  startTimer('complex-op', 'Complex Operation');

  startTimer('step-1', 'Step 1: Data Fetch');
  const data = await fetchData();
  endTimer('step-1');

  startTimer('step-2', 'Step 2: Data Processing');
  const processed = processData(data);
  endTimer('step-2');

  startTimer('step-3', 'Step 3: Rendering');
  render(processed);
  endTimer('step-3');

  endTimer('complex-op');
}
```

## Best Practices

1. Always end timers that you start to prevent memory leaks
2. Use descriptive timer labels for easy identification
3. Use unique timer IDs to prevent conflicts
4. Check `enabled` flag before expensive logging operations
5. Clean up timers periodically if they accumulate
6. Disable logging in production for performance
7. Use timers for performance-critical operations
8. Consider using `withTimer` or `withTimerAsync` for automatic cleanup
