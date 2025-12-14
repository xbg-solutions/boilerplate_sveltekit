# Event Bus Store

## Overview
Manages a simple event bus for application-wide event communication. Tracks events, listeners, and provides methods to emit events, register listeners, and manage event subscriptions.

## Store Location
`src/lib/stores/event-bus.ts`

## State Structure

```typescript
interface EventBusState {
  events: Array<{
    type: string;               // Event type identifier
    data?: any;                 // Event payload
    timestamp: number;          // When event was emitted
  }>;
  listeners: Record<string, Function[]>; // Registered event listeners
}
```

## Key Methods (eventBusService)

- `emit(type: string, data?: any)` - Emit an event
- `on(type: string, callback: Function)` - Register event listener
- `off(type: string, callback: Function)` - Unregister event listener
- `clear()` - Clear all events and listeners

## Usage Examples

### Subscribe to Event Bus State
```typescript
import { eventBusStore } from '$lib/stores/event-bus';

eventBusStore.subscribe($eventBus => {
  console.log('Recent events:', $eventBus.events);
  console.log('Active listeners:', Object.keys($eventBus.listeners));
});
```

### Emit Event
```typescript
import { eventBusService } from '$lib/stores/event-bus';

eventBusService.emit('user:login', {
  userId: '123',
  timestamp: Date.now()
});
```

### Register Event Listener
```typescript
import { eventBusService } from '$lib/stores/event-bus';

const unsubscribe = eventBusService.on('user:login', (data) => {
  console.log('User logged in:', data.userId);
});

// Later, to unsubscribe
unsubscribe();
```

### Unregister Listener
```typescript
import { eventBusService } from '$lib/stores/event-bus';

function handleLogin(data) {
  console.log('Login:', data);
}

eventBusService.on('user:login', handleLogin);

// Later, remove specific listener
eventBusService.off('user:login', handleLogin);
```

### Clear Event Bus
```typescript
import { eventBusService } from '$lib/stores/event-bus';

eventBusService.clear();
```

### Multiple Listeners
```typescript
import { eventBusService } from '$lib/stores/event-bus';

// Register multiple listeners for the same event
eventBusService.on('data:updated', (data) => {
  console.log('Listener 1:', data);
});

eventBusService.on('data:updated', (data) => {
  console.log('Listener 2:', data);
});

// Both will be called when event is emitted
eventBusService.emit('data:updated', { value: 42 });
```

### Event History
```typescript
import { eventBusStore } from '$lib/stores/event-bus';
import { get } from 'svelte/store';

const $eventBus = get(eventBusStore);
const recentEvents = $eventBus.events.slice(-10); // Last 10 events

console.log('Recent event types:', recentEvents.map(e => e.type));
```

### Typed Event Emitter
```typescript
import { eventBusService } from '$lib/stores/event-bus';

type EventMap = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:updated': { key: string; value: any };
};

function typedEmit<K extends keyof EventMap>(
  type: K,
  data: EventMap[K]
) {
  eventBusService.emit(type, data);
}

// Type-safe emission
typedEmit('user:login', {
  userId: '123',
  timestamp: Date.now()
});
```

### Event Logger
```typescript
import { eventBusStore } from '$lib/stores/event-bus';

eventBusStore.subscribe($eventBus => {
  const latestEvent = $eventBus.events[$eventBus.events.length - 1];

  if (latestEvent) {
    console.log(`[Event] ${latestEvent.type}`, latestEvent.data);
  }
});
```

## Integration Points

- **Pub-Sub Service** (`src/lib/stores/pub-sub.ts`) - Alternative event system
- **Event Store** (`src/lib/stores/event.store.ts`) - Svelte store integration
- **Services** - Emit domain events
- **Components** - Listen to and emit UI events
- **Middleware** - Track or intercept events

## Common Event Types

- `user:login` - User logged in
- `user:logout` - User logged out
- `user:updated` - User profile updated
- `data:loaded` - Data loaded
- `data:updated` - Data changed
- `error:occurred` - Error happened
- `navigation:changed` - Route changed

## Event Naming Conventions

Use a consistent naming pattern:
- `domain:action` - Standard format (e.g., `user:login`)
- `domain:entity:action` - Nested format (e.g., `admin:user:deleted`)
- Use lowercase with colons as separators

## Best Practices

1. Use descriptive event type names
2. Always include relevant data in event payload
3. Unsubscribe from events when component unmounts
4. Store unsubscribe function returned by `on()`
5. Use `clear()` to reset state in tests
6. Consider using typed events for better type safety
7. Avoid emitting events in tight loops (performance)
8. Keep event payloads serializable
9. Document custom event types in your application
10. Consider using pub-sub service for more advanced event handling

## Event History Management

```typescript
import { eventBusStore } from '$lib/stores/event-bus';

// Limit event history size
eventBusStore.subscribe($state => {
  if ($state.events.length > 100) {
    eventBusStore.update(state => ({
      ...state,
      events: state.events.slice(-50) // Keep last 50
    }));
  }
});
```

## Cleanup Pattern

```typescript
import { onDestroy } from 'svelte';
import { eventBusService } from '$lib/stores/event-bus';

// In a Svelte component
const unsubscribers: Array<() => void> = [];

unsubscribers.push(
  eventBusService.on('event1', handler1),
  eventBusService.on('event2', handler2)
);

onDestroy(() => {
  unsubscribers.forEach(unsubscribe => unsubscribe());
});
```
