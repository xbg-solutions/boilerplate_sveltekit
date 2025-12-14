# Events Service

**Location**: `src/lib/services/events/`

## Overview

The Events Service is a comprehensive event bus system implementing the publish-subscribe (pub-sub) pattern for loosely-coupled communication across the application. It provides both a low-level event bus implementation and a higher-level PubSub API, enabling components, services, and stores to communicate without direct dependencies. The system supports wildcard subscriptions, async handlers, debug mode, and includes mutex-based ordering guarantees.

## Features

- **Pub-Sub Pattern**: Decoupled event-driven communication
- **Multiple Subscription Patterns**: Exact match and prefix wildcards (`auth:*`)
- **Async Support**: Handlers can be sync or async
- **Event Ordering**: Mutex-based guarantee for sequential event processing
- **Debug Mode**: Detailed logging for development and troubleshooting
- **One-Time Subscriptions**: Built-in `once()` for single-fire handlers
- **Type Safety**: Full TypeScript support with generic payloads
- **Svelte Store Integration**: Event-connected stores via `eventStore()`
- **Statistics**: Subscription metrics and monitoring

## Architecture

```
Component/Service
     ↓
PubSub Service (High-Level API)
     ↓
Event Bus (Core Implementation)
     ↓
Subscribers (Event Handlers)
```

**Event Flow:**
1. Publisher calls `publish(eventType, payload)`
2. Event bus wraps payload in `AppEvent` structure
3. Mutex ensures sequential processing
4. Event bus finds all matching handlers
5. Handlers execute (sync/async)
6. Errors are caught and logged per handler

## Core Methods

### `publish<T>(eventType: string, payload: T, source?: string, options?: EventDispatchOptions): void`

Publishes an event to all subscribers.

**Parameters:**
- `eventType`: Event identifier (e.g., 'auth:login', 'user:updated')
- `payload`: Event data of type T
- `source`: Optional identifier for the publisher (component/service name)
- `options.defer`: If true, defers execution to next microtask

**Usage:**
```typescript
import { publish } from '$lib/services/events';

// Simple publish
publish('user:updated', { userId: '123', name: 'John' });

// With source identifier
publish('auth:login',
  { user: userData },
  'LoginComponent'
);

// Deferred execution
publish('data:loaded',
  { items: [] },
  'DataService',
  { defer: true }
);
```

### `subscribe<T>(eventType: string | string[], handler: EventHandler<T>, context?: any): Subscription`

Subscribes to one or more event types.

**Parameters:**
- `eventType`: Event type string or array of event types
- `handler`: Function called when event is published - `(payload: T, event: AppEvent<T>) => void`
- `context`: Optional `this` context for the handler

**Returns:** Unsubscribe function

**Usage:**
```typescript
import { subscribe } from '$lib/services/events';

// Single event subscription
const unsubscribe = subscribe('user:login', (payload, event) => {
  console.log('User logged in:', payload.userId);
  console.log('Event source:', event.source);
  console.log('Timestamp:', event.timestamp);
});

// Multiple events
const unsub = subscribe(
  ['user:login', 'user:logout'],
  (payload) => {
    console.log('Auth event:', payload);
  }
);

// Wildcard subscription (all auth events)
const authUnsub = subscribe('auth:*', (payload, event) => {
  console.log('Auth event type:', event.type);
  console.log('Payload:', payload);
});

// With context binding
class MyComponent {
  handleEvent(payload, event) {
    console.log('Component:', this.name);
  }

  init() {
    subscribe('data:updated', this.handleEvent, this);
  }
}

// Clean up when done
unsubscribe();
```

**Handler Signature:**
```typescript
type EventHandler<T> = (payload: T, event: AppEvent<T>) => void | Promise<void>;
```

**Event Structure:**
```typescript
interface AppEvent<T> {
  type: string;        // Event type identifier
  timestamp: number;   // When event was created
  source?: string;     // Publisher identifier
  payload: T;          // Event data
  meta?: Record<string, any>; // Optional metadata
}
```

### `once<T>(eventType: string, handler: EventHandler<T>, context?: any): Subscription`

Subscribes to an event for only the first occurrence.

**Parameters:**
- `eventType`: Event type to listen for
- `handler`: Function called once when event fires
- `context`: Optional `this` context

**Returns:** Unsubscribe function (for early cancellation)

**Usage:**
```typescript
import { once } from '$lib/services/events';

// Wait for initialization
once('app:initialized', (payload) => {
  console.log('App is ready!');
  // Handler is automatically unsubscribed after execution
});

// Wait for first login
const cancelWait = once('user:login', (payload) => {
  console.log('First login detected:', payload.user);
});

// Cancel early if needed
cancelWait();
```

### `hasSubscribers(eventType: string): boolean`

Checks if an event type has any subscribers.

**Returns:** `true` if there are subscribers

**Usage:**
```typescript
import { hasSubscribers } from '$lib/services/events';

if (hasSubscribers('data:updated')) {
  // Only process if someone is listening
  const data = expensiveDataProcessing();
  publish('data:updated', data);
}
```

### `setDebugMode(enabled: boolean): void`

Enables or disables debug logging for the event bus.

**Usage:**
```typescript
import { setDebugMode } from '$lib/services/events';

// Enable debug mode
setDebugMode(true);

// All events will now be logged:
// - Subscriptions
// - Unsubscriptions
// - Event publications
// - Handler execution results
// - Errors
```

### `clear(): void`

Clears all event subscriptions. Use with caution.

**Usage:**
```typescript
import { clear } from '$lib/services/events';

// Remove all subscriptions
clear();
```

### `getSubscriptionStats(): { subscribers: number, eventTypes: number, prefixSubscribers: number }`

Gets statistics about current subscriptions.

**Returns:**
- `subscribers`: Total number of subscribers (including prefix)
- `eventTypes`: Number of distinct event types
- `prefixSubscribers`: Number of wildcard subscriptions

**Usage:**
```typescript
import { getSubscriptionStats } from '$lib/services/events';

const stats = getSubscriptionStats();
console.log(`${stats.subscribers} subscribers across ${stats.eventTypes} event types`);
console.log(`${stats.prefixSubscribers} wildcard subscriptions`);
```

## Event Patterns and Best Practices

### Event Naming Convention

Use the `domain:action` pattern for event names:

```typescript
// Auth domain
'auth:login'
'auth:logout'
'auth:stateChanged'

// User domain
'user:created'
'user:updated'
'user:deleted'

// Data domain
'data:loaded'
'data:saved'
'data:error'

// UI domain
'modal:opened'
'modal:closed'
'toast:show'
```

### Wildcard Subscriptions

Subscribe to all events in a domain using the `*` suffix:

```typescript
import { subscribe } from '$lib/services/events';

// Listen to all auth events
subscribe('auth:*', (payload, event) => {
  console.log('Auth event:', event.type);
  logAnalytics(event);
});

// Listen to all user events
subscribe('user:*', (payload, event) => {
  syncToServer(event);
});
```

### Async Event Handlers

Handlers can be async, and errors are automatically caught:

```typescript
import { subscribe } from '$lib/services/events';

subscribe('data:save', async (payload) => {
  try {
    await api.save(payload);
    publish('data:saved', { id: payload.id });
  } catch (error) {
    // Error is caught and logged by event bus
    publish('data:error', { error: error.message });
  }
});
```

### Event Chaining

Events can trigger other events:

```typescript
import { subscribe, publish } from '$lib/services/events';

// Chain 1: User logs in
subscribe('auth:login', (payload) => {
  publish('user:profile:load', { userId: payload.user.uid });
});

// Chain 2: Profile loads
subscribe('user:profile:load', async (payload) => {
  const profile = await loadProfile(payload.userId);
  publish('user:profile:loaded', profile);
});

// Chain 3: Profile loaded
subscribe('user:profile:loaded', (profile) => {
  console.log('Profile ready:', profile);
});
```

### Decoupling Components

Use events instead of direct component dependencies:

```typescript
// Component A - Publisher
function handleAction() {
  publish('action:completed', {
    actionId: '123',
    result: 'success'
  });
}

// Component B - Subscriber (no knowledge of Component A)
subscribe('action:completed', (payload) => {
  updateUI(payload.result);
});

// Component C - Also subscribes (no knowledge of A or B)
subscribe('action:completed', (payload) => {
  sendAnalytics(payload);
});
```

### Error Isolation

One handler's error doesn't affect others:

```typescript
subscribe('data:update', (payload) => {
  // This error is caught and logged
  throw new Error('Handler 1 failed');
});

subscribe('data:update', (payload) => {
  // This still executes even if handler 1 failed
  console.log('Handler 2 executed');
});

// Both handlers run; first error is logged but doesn't stop second
publish('data:update', { id: '123' });
```

## Core Event Types

Standard events defined in `CoreEventType` enum:

### Authentication Events
```typescript
CoreEventType.AUTH_STATE_CHANGED  // Auth state changed
CoreEventType.AUTH_LOGIN_SUCCESS  // User logged in
CoreEventType.AUTH_LOGIN_FAILURE  // Login failed
CoreEventType.AUTH_LOGOUT         // User logged out
```

### Token Events
```typescript
CoreEventType.TOKEN_REFRESHED     // Token was refreshed
CoreEventType.TOKEN_EXPIRED       // Token expired
```

### Application Lifecycle
```typescript
CoreEventType.APP_INITIALIZED     // App initialization complete
CoreEventType.APP_ERROR           // Application error occurred
```

### Navigation Events
```typescript
CoreEventType.NAVIGATION_START    // Navigation started
CoreEventType.NAVIGATION_END      // Navigation completed
```

### Store Events
```typescript
CoreEventType.STORE_UPDATED       // Store state updated
CoreEventType.STORE_RESET         // Store reset to initial state
```

### Toast Events
```typescript
CoreEventType.TOAST_SHOW          // Show toast notification
CoreEventType.TOAST_HIDE          // Hide specific toast
CoreEventType.TOAST_CLEAR         // Clear all toasts
```

### Tab Sync Events
```typescript
CoreEventType.TAB_SYNC_REQUEST    // Request tab synchronization
CoreEventType.TAB_SYNC_RESPONSE   // Tab sync response
```

**Usage:**
```typescript
import { subscribe, publish, CoreEventType } from '$lib/services/events';

// Subscribe using enum
subscribe(CoreEventType.AUTH_LOGIN_SUCCESS, (payload) => {
  console.log('Login successful');
});

// Publish using enum
publish(CoreEventType.TOAST_SHOW, {
  type: 'success',
  message: 'Action completed'
});
```

## Usage Examples

### Basic Service Communication

```typescript
// data.service.ts
import { publish } from '$lib/services/events';

export async function loadData() {
  publish('data:loading', { source: 'api' });

  try {
    const data = await fetch('/api/data').then(r => r.json());
    publish('data:loaded', { data, count: data.length });
  } catch (error) {
    publish('data:error', { error: error.message });
  }
}

// +page.svelte
import { subscribe } from '$lib/services/events';
import { onMount, onDestroy } from 'svelte';

let isLoading = false;
let data = [];

onMount(() => {
  const subscriptions = [
    subscribe('data:loading', () => {
      isLoading = true;
    }),

    subscribe('data:loaded', (payload) => {
      data = payload.data;
      isLoading = false;
    }),

    subscribe('data:error', (payload) => {
      isLoading = false;
      alert(`Error: ${payload.error}`);
    })
  ];

  // Clean up on destroy
  onDestroy(() => {
    subscriptions.forEach(unsub => unsub());
  });
});
```

### Cross-Tab Communication

```typescript
import { subscribe, publish } from '$lib/services/events';

// Listen for sync requests
subscribe('tab:sync:request', (payload, event) => {
  // Another tab wants current state
  const currentState = getCurrentAppState();
  publish('tab:sync:response', {
    tabId: event.source,
    state: currentState
  });
});

// Request sync from other tabs
publish('tab:sync:request', {
  tabId: myTabId
}, 'CurrentTab');
```

### Analytics Integration

```typescript
import { subscribe } from '$lib/services/events';

// Track all user actions
subscribe('user:*', (payload, event) => {
  analytics.track(event.type, {
    timestamp: event.timestamp,
    userId: payload.userId,
    ...payload
  });
});

// Track specific business events
subscribe('purchase:completed', (payload) => {
  analytics.revenue(payload.amount, payload.items);
});
```

### Form State Management

```typescript
import { publish, subscribe } from '$lib/services/events';

// Form component
function handleSubmit() {
  publish('form:submit', { formId: 'contact' });
}

// Validation service
subscribe('form:submit', async (payload) => {
  const isValid = await validateForm(payload.formId);

  if (isValid) {
    publish('form:valid', payload);
  } else {
    publish('form:invalid', {
      formId: payload.formId,
      errors: getValidationErrors()
    });
  }
});

// API service
subscribe('form:valid', async (payload) => {
  try {
    await submitToAPI(payload);
    publish('form:success', payload);
  } catch (error) {
    publish('form:error', { ...payload, error });
  }
});
```

## Svelte Store Integration

Create reactive stores connected to events:

```typescript
import { eventStore, eventDerived } from '$lib/services/events';

// Create a store that updates on events
const userStore = eventStore(
  'user:updated',
  { name: '', email: '' }, // Initial value
  (payload) => payload.user // Transform payload to store value
);

// Create derived store from multiple event types
const authStatus = eventDerived(
  ['auth:login', 'auth:logout'],
  false, // Initial value
  (payload, event) => event.type === 'auth:login'
);

// Use in components
$: console.log('Current user:', $userStore);
$: console.log('Is logged in:', $authStatus);
```

**Advanced Store Connection:**
```typescript
import { connectStoreToEvents, publish } from '$lib/services/events';
import { writable } from 'svelte/store';

const myStore = writable({ count: 0 });

// Publish store changes as events
connectStoreToEvents(
  myStore,
  'counter:updated',
  'CounterStore'
);

// Updates to myStore now publish events
myStore.update(s => ({ count: s.count + 1 }));
// Event 'counter:updated' is published with { count: 1 }
```

## Low-Level Event Bus API

For advanced use cases, access the event bus directly:

```typescript
import { eventBus } from '$lib/services/events';

// Direct subscription
const unsub = eventBus.on('custom:event', (event) => {
  console.log('Raw event:', event);
});

// Direct publication
await eventBus.publish({
  type: 'custom:event',
  timestamp: Date.now(),
  source: 'CustomService',
  payload: { data: 'value' }
}, { defer: true });

// Check subscribers
const hasListeners = eventBus.hasSubscribers('custom:event');

// Debug mode
eventBus.setDebugMode(true);

// Get stats
const stats = eventBus.getStats();

// Clear all
eventBus.clear();
```

## Testing

### Testing Event Publishers

```typescript
import { describe, test, expect, vi } from 'vitest';
import { publish } from '$lib/services/events';

describe('Data Service', () => {
  test('publishes load event', () => {
    const publishSpy = vi.spyOn({ publish }, 'publish');

    loadData();

    expect(publishSpy).toHaveBeenCalledWith(
      'data:loading',
      expect.any(Object)
    );
  });
});
```

### Testing Event Subscribers

```typescript
import { describe, test, expect } from 'vitest';
import { subscribe, publish } from '$lib/services/events';

describe('Event Handlers', () => {
  test('handles data loaded event', async () => {
    let receivedData = null;

    subscribe('data:loaded', (payload) => {
      receivedData = payload;
    });

    publish('data:loaded', { items: [1, 2, 3] });

    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(receivedData).toEqual({ items: [1, 2, 3] });
  });
});
```

### Mocking Events in Tests

```typescript
import { vi } from 'vitest';

// Mock the events module
vi.mock('$lib/services/events', () => ({
  publish: vi.fn(),
  subscribe: vi.fn(() => vi.fn()), // Return mock unsubscribe
  once: vi.fn(() => vi.fn())
}));
```

## Performance Considerations

**Event Deferral**: Use `defer: true` for non-critical events to improve responsiveness:
```typescript
publish('analytics:track', data, 'Component', { defer: true });
```

**Subscription Cleanup**: Always unsubscribe to prevent memory leaks:
```typescript
const unsub = subscribe('event', handler);
onDestroy(() => unsub());
```

**Wildcard Usage**: Wildcard subscriptions check all events; use sparingly for performance.

**Handler Efficiency**: Keep handlers lightweight; offload heavy work:
```typescript
subscribe('data:heavy', (payload) => {
  // Queue heavy work instead of doing it immediately
  queueMicrotask(() => processHeavyData(payload));
});
```

## Error Handling

The event bus catches all handler errors and logs them without stopping other handlers:

```typescript
subscribe('event', () => {
  throw new Error('Handler 1 error');
  // Error is caught, logged, and execution continues
});

subscribe('event', () => {
  console.log('Handler 2 still runs');
});

publish('event', {}); // Both handlers execute
```

**Custom Error Handling:**
```typescript
subscribe('risky:operation', async (payload) => {
  try {
    await riskyOperation(payload);
  } catch (error) {
    // Handle error explicitly
    publish('operation:failed', {
      error: error.message,
      payload
    });
  }
});
```

## Dependencies

- **Svelte Stores**: Writable stores for service instances
- **Logger Service**: Contextual logging with `EventBus` context
- **Mutex Service**: Sequential event processing guarantee
- **Error Handler**: Error normalization and AppError class

## Configuration

Debug mode defaults to development environment:
```typescript
// In event-bus.ts
private debugMode: boolean = import.meta.env.DEV;
```

Enable/disable at runtime:
```typescript
setDebugMode(true); // Enable debug logging
```

## Integration with Other Services

The events service is used by:

- **Auth Service**: Publishes login/logout events
- **Token Service**: Publishes token refresh/expiry events
- **Toast Service**: Publishes and subscribes to toast events
- **Tab Sync Service**: Cross-tab state synchronization
- **API Service**: Request lifecycle events
- **State Service**: Store synchronization events

## Related Documentation

- [Toast Service](./toast.md)
- [Auth Service](./auth.md)
- [Event Store](../stores/event.md)
- [Event Types](../types/event-types.md)

---

**Built for agentic development by [XBG Solutions](https://xbg.solutions)**
