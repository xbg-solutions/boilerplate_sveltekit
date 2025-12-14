# Pub-Sub Store

## Overview
Manages a publish-subscribe messaging system for application-wide communication. Tracks subscribers, message count, and provides methods for publishing messages and subscribing to topics.

## Store Location
`src/lib/stores/pub-sub.ts`

## State Structure

```typescript
interface PubSubState {
  subscribers: Record<string, Function[]>; // Topic subscribers
  messageCount: number;                     // Total messages published
}
```

## Key Methods (pubSubService)

- `publish(topic: string, data?: any)` - Publish a message to a topic
- `subscribe(topic: string, callback: Function)` - Subscribe to a topic
- `clear()` - Clear all subscribers and reset message count

## Usage Examples

### Subscribe to Pub-Sub State
```typescript
import { pubSubStore } from '$lib/stores/pub-sub';

pubSubStore.subscribe($pubSub => {
  console.log('Total messages:', $pubSub.messageCount);
  console.log('Active topics:', Object.keys($pubSub.subscribers));
});
```

### Publish Message
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

pubSubService.publish('user.login', {
  userId: '123',
  timestamp: Date.now()
});
```

### Subscribe to Topic
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

const unsubscribe = pubSubService.subscribe('user.login', (data) => {
  console.log('User logged in:', data.userId);
});

// Later, to unsubscribe
unsubscribe();
```

### Multiple Topics
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

// Subscribe to multiple topics
const unsubscribers = [
  pubSubService.subscribe('user.login', handleLogin),
  pubSubService.subscribe('user.logout', handleLogout),
  pubSubService.subscribe('user.updated', handleUpdate)
];

// Cleanup
unsubscribers.forEach(unsub => unsub());
```

### Wildcard Subscriptions (if supported)
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

// Subscribe to all user events
pubSubService.subscribe('user.*', (data) => {
  console.log('User event:', data);
});
```

### Clear Pub-Sub
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

pubSubService.clear();
```

### Topic Namespacing
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

// Use namespace patterns
pubSubService.publish('app.auth.login', userData);
pubSubService.publish('app.data.loaded', dataArray);
pubSubService.publish('app.ui.themeChanged', theme);

pubSubService.subscribe('app.auth.login', handleLogin);
pubSubService.subscribe('app.data.loaded', handleDataLoaded);
pubSubService.subscribe('app.ui.themeChanged', handleThemeChange);
```

### Request-Response Pattern
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

// Responder
pubSubService.subscribe('request.getUserData', (request) => {
  const userData = fetchUserData(request.userId);
  pubSubService.publish(`response.getUserData.${request.requestId}`, userData);
});

// Requester
const requestId = generateId();
pubSubService.subscribe(`response.getUserData.${requestId}`, (data) => {
  console.log('Received user data:', data);
});

pubSubService.publish('request.getUserData', {
  userId: '123',
  requestId
});
```

### Throttled Publishing
```typescript
import { pubSubService } from '$lib/stores/pub-sub';

let timeout: NodeJS.Timeout;

function throttledPublish(topic: string, data: any, delay = 300) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    pubSubService.publish(topic, data);
  }, delay);
}

// Use for frequently updated data
throttledPublish('ui.scroll', { position: scrollY });
```

### Track Message Count
```typescript
import { pubSubStore } from '$lib/stores/pub-sub';
import { derived } from 'svelte/store';

const messagesPublished = derived(
  pubSubStore,
  $pubSub => $pubSub.messageCount
);

messagesPublished.subscribe(count => {
  console.log('Total messages published:', count);
});
```

## Integration Points

- **Event Bus** (`src/lib/stores/event-bus.ts`) - Alternative event system
- **Event Store** (`src/lib/stores/event.store.ts`) - Svelte store integration
- **Services** - Publish domain events
- **Components** - Subscribe to UI-related topics
- **State Sync** - Synchronize state across components

## Topic Naming Conventions

Use hierarchical topic names with dots:
- `domain.action` - Standard format (e.g., `user.login`)
- `domain.entity.action` - Nested format (e.g., `admin.user.created`)
- `module.component.event` - Component events (e.g., `ui.modal.opened`)

## Common Topics

- `user.login` - User logged in
- `user.logout` - User logged out
- `user.updated` - User profile updated
- `data.fetched` - Data fetched from API
- `data.changed` - Data modified
- `ui.theme.changed` - Theme switched
- `notification.show` - Show notification
- `error.occurred` - Error happened

## Best Practices

1. Use consistent topic naming conventions
2. Unsubscribe when component unmounts to prevent memory leaks
3. Keep topic names descriptive and hierarchical
4. Use namespacing to avoid topic collisions
5. Store unsubscribe function for cleanup
6. Clear pub-sub state in tests
7. Avoid publishing in tight loops
8. Keep message payloads serializable
9. Document custom topics in your application
10. Consider using topic wildcards for related events

## Cleanup Pattern

```typescript
import { onDestroy } from 'svelte';
import { pubSubService } from '$lib/stores/pub-sub';

// In a Svelte component
const subscriptions: Array<() => void> = [];

subscriptions.push(
  pubSubService.subscribe('topic1', handler1),
  pubSubService.subscribe('topic2', handler2),
  pubSubService.subscribe('topic3', handler3)
);

onDestroy(() => {
  subscriptions.forEach(unsubscribe => unsubscribe());
});
```

## Typed Pub-Sub

```typescript
import { pubSubService } from '$lib/stores/pub-sub';

type TopicMap = {
  'user.login': { userId: string; timestamp: number };
  'user.logout': { userId: string };
  'data.updated': { key: string; value: any };
};

function typedPublish<K extends keyof TopicMap>(
  topic: K,
  data: TopicMap[K]
) {
  pubSubService.publish(topic, data);
}

function typedSubscribe<K extends keyof TopicMap>(
  topic: K,
  callback: (data: TopicMap[K]) => void
) {
  return pubSubService.subscribe(topic, callback);
}

// Type-safe usage
typedPublish('user.login', {
  userId: '123',
  timestamp: Date.now()
});

typedSubscribe('user.login', (data) => {
  console.log('User ID:', data.userId); // Typed!
});
```

## Difference from Event Bus

- **Pub-Sub**: Topic-based, hierarchical namespacing, focused on messaging patterns
- **Event Bus**: Event-based, tracks event history, simpler API

Use Pub-Sub when:
- You need topic-based routing
- You want hierarchical topic organization
- You need wildcard subscriptions
- You're implementing messaging patterns (request-response, etc.)

Use Event Bus when:
- You need simple event emission
- You want event history tracking
- You prefer event-based rather than topic-based communication
