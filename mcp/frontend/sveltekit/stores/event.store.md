# Event Store

## Overview
Provides utilities for integrating the event system with Svelte stores. Enables creating stores that automatically update based on events and optionally publish events when store values change. Follows the architecture principle that "events trigger workflows that may update stores."

## Store Location
`src/lib/stores/event.store.ts`

## Key Functions

### eventStore()
Creates a writable store that automatically updates based on events and optionally publishes events when the store value changes.

```typescript
interface EventStoreOptions<T> {
  initialValue: T;              // Initial value for the store
  eventType: string;            // Event type to listen for updates
  transformer?: (payload: any) => T; // Transform event payload to store value
  publishOnChange?: boolean;    // Whether to publish events when store changes
  publishEventType?: string;    // Event type to publish (defaults to eventType)
  eventSource?: string;         // Additional context for published events
}

function eventStore<T>(options: EventStoreOptions<T>): Writable<T>
```

### eventDerived()
Creates a derived store that updates based on events with transforms applied to incoming event data.

```typescript
function eventDerived<T, K = any>(
  eventTypes: string | string[],
  deriveFn: (payload: K, event?: any) => T,
  initialValue: T
): Readable<T>
```

### connectStoreToEvents()
Connects a store to an event type, publishing events when the store changes.

```typescript
function connectStoreToEvents<T>(
  store: Readable<T>,
  eventType: string,
  source?: string
): Subscription
```

## Usage Examples

### Create Event-Connected Store
```typescript
import { eventStore } from '$lib/stores/event.store';

const userStore = eventStore({
  initialValue: null,
  eventType: 'user:updated',
  transformer: (payload) => payload.user
});
```

### Create Store with Event Publishing
```typescript
import { eventStore } from '$lib/stores/event.store';

const themeStore = eventStore({
  initialValue: 'light',
  eventType: 'theme:changed',
  publishOnChange: true,
  eventSource: 'themeStore'
});

// When store updates, it automatically publishes 'theme:changed' event
themeStore.set('dark');
```

### Create Derived Store from Events
```typescript
import { eventDerived } from '$lib/stores/event.store';

const notificationCount = eventDerived(
  ['notification:added', 'notification:removed'],
  (payload) => payload.count,
  0
);
```

### Connect Existing Store to Events
```typescript
import { writable } from 'svelte/store';
import { connectStoreToEvents } from '$lib/stores/event.store';

const myStore = writable(initialValue);
const unsubscribe = connectStoreToEvents(myStore, 'my:event', 'myComponent');

// Clean up when done
unsubscribe();
```

### Cleanup Event Connections
```typescript
import { eventStore } from '$lib/stores/event.store';

const store = eventStore({
  initialValue: 0,
  eventType: 'counter:updated'
});

// Later, when cleaning up
if (store.destroy) {
  store.destroy(); // Unsubscribes from events
}
```

## Integration Points

- **Pub-Sub Service** (`src/lib/services/events/pub-sub`) - Uses `subscribe()` and `publish()`
- **Event Types** (`src/lib/types/event.types.ts`) - Defines event type constants
- **All Stores** - Any store can be connected to the event system
- **Components** - Use event stores for reactive UI updates
- **Services** - Services can update event stores by publishing events

## Patterns

### One-Way Data Flow (Events → Store)
```typescript
const dataStore = eventStore({
  initialValue: [],
  eventType: 'data:loaded',
  transformer: (payload) => payload.items
});
```

### Two-Way Data Flow (Store ↔ Events)
```typescript
const syncedStore = eventStore({
  initialValue: null,
  eventType: 'state:changed',
  publishOnChange: true, // Store updates trigger events
  publishEventType: 'state:updated'
});
```

### Multiple Event Sources
```typescript
const aggregatedStore = eventDerived(
  ['source1:updated', 'source2:updated', 'source3:updated'],
  (payload, event) => {
    // Combine data from multiple events
    return processPayload(payload, event.type);
  },
  defaultValue
);
```

## Best Practices

1. Use `eventStore()` when you need bidirectional event-store binding
2. Use `eventDerived()` for read-only stores derived from events
3. Always clean up event subscriptions using `destroy()` method
4. Avoid feedback loops when using `publishOnChange`
5. Use `transformer` to normalize event payloads to store format
6. Set meaningful `eventSource` for debugging and tracking
7. Use specific event types rather than generic ones
