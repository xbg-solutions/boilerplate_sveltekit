# State Management Service

## Overview

The State Management Service provides centralized state management with domain-based organization, persistence capabilities, state versioning and migration, and integration with the event system. It wraps Svelte stores with additional functionality for immutable updates and lifecycle management.

## Location

- **Service**: `/src/lib/services/state/state-manager.service.ts`
- **Store**: `/src/lib/stores/state-manager.store.ts`
- **Export**: `/src/lib/services/state/index.ts`
- **Types**: `/src/lib/types/state-manager.types.ts`

## Key Concepts

### State Domains

State is organized into domains, each with:
- Unique identifier (domain name)
- Initial state
- Optional persistence strategy
- Optional versioning and migration
- Optional event emission

### Persistence Strategies

```typescript
enum PersistenceStrategy {
  NONE = 'none',           // No persistence
  LOCAL = 'local',         // localStorage
  SESSION = 'session'      // sessionStorage
}
```

## Key Methods

### createStore(domain, options)

Creates a new state domain.

```typescript
const userStore = stateManagerService.createStore('user', {
  initialState: { id: '', name: '', email: '' },
  version: 1,
  persistence: PersistenceStrategy.LOCAL,
  logChanges: true,
  emitEvents: true,
  eventType: 'state:user:changed'
});
```

**Options**:
- `initialState` (required) - Initial state value
- `version` (optional) - State version for migrations (default: 1)
- `persistence` (optional) - Persistence strategy (default: NONE)
- `storageKey` (optional) - Custom storage key
- `logChanges` (optional) - Log state changes (default: false)
- `emitEvents` (optional) - Emit events on changes (default: false)
- `eventType` (optional) - Custom event type (default: `state:{domain}:changed`)
- `eventSource` (optional) - Event source identifier (default: 'StateManager')
- `migrations` (optional) - Migration functions keyed by version

**Returns**: Enhanced StateStore with additional methods

### getStore(domain)

Retrieves an existing state domain.

```typescript
const userStore = stateManagerService.getStore<UserState>('user');
if (userStore) {
  const currentUser = userStore.getValue();
}
```

**Returns**: StateStore or null if domain doesn't exist

### hasDomain(domain)

Check if a domain exists.

```typescript
if (stateManagerService.hasDomain('user')) {
  // Domain exists
}
```

### getDomains()

Get list of all domain names.

```typescript
const domains = stateManagerService.getDomains();
console.log('Registered domains:', domains);
```

### getDomainMeta(domain)

Get metadata for a domain.

```typescript
const meta = stateManagerService.getDomainMeta('user');
console.log('Version:', meta.version);
console.log('Last updated:', meta.lastUpdated);
```

### resetDomain(domain)

Reset a domain to its initial state.

```typescript
stateManagerService.resetDomain('user');
```

### clearDomain(domain)

Remove a domain entirely (including from storage).

```typescript
stateManagerService.clearDomain('user');
```

### persistAll()

Persist all domains with persistence enabled.

```typescript
const result = stateManagerService.persistAll();
console.log(`${result.success} succeeded, ${result.failed} failed`);
```

### hydrateAll()

Hydrate all domains from storage.

```typescript
const result = stateManagerService.hydrateAll();
console.log(`${result.success} hydrated, ${result.failed} failed`);
```

### resetAll()

Reset all domains to initial state.

```typescript
stateManagerService.resetAll();
```

## StateStore Methods

Enhanced stores created by the service provide:

### Standard Svelte Store Methods

```typescript
// Subscribe to changes
const unsubscribe = userStore.subscribe(state => {
  console.log('User state:', state);
});

// Set new state
userStore.set({ id: '123', name: 'John', email: 'john@example.com' });

// Update state
userStore.update(state => ({
  ...state,
  name: 'John Doe'
}));
```

### Enhanced Methods

```typescript
// Get current value without subscribing
const currentState = userStore.getValue();

// Reset to initial state
userStore.reset();

// Update a single property
userStore.updateProperty('name', 'Jane Doe');

// Update multiple properties
userStore.setProperties({
  name: 'Jane Doe',
  email: 'jane@example.com'
});

// Get domain name
const domain = userStore.getDomain();

// Get version
const version = userStore.getVersion();
```

## Usage Examples

### Basic State Domain

```typescript
import { stateManagerService } from '$lib/services/state';

// Create a simple state domain
const counterStore = stateManagerService.createStore('counter', {
  initialState: { count: 0 }
});

// Use it
counterStore.update(state => ({
  count: state.count + 1
}));

console.log(counterStore.getValue().count); // 1
```

### Persistent State

```typescript
// Create a persistent state domain
const settingsStore = stateManagerService.createStore('settings', {
  initialState: {
    theme: 'light',
    language: 'en',
    notifications: true
  },
  persistence: PersistenceStrategy.LOCAL,
  version: 1
});

// Updates are automatically persisted
settingsStore.updateProperty('theme', 'dark');

// On next page load, state is automatically hydrated
```

### State with Events

```typescript
// Create a state domain that emits events
const cartStore = stateManagerService.createStore('cart', {
  initialState: { items: [], total: 0 },
  emitEvents: true,
  eventType: 'cart:changed',
  logChanges: true
});

// Subscribe to state change events
subscribe('cart:changed', (event) => {
  console.log('Cart updated:', event.payload.value);
  console.log('Previous cart:', event.payload.previousValue);
});

// Update cart (will emit event)
cartStore.update(state => ({
  ...state,
  items: [...state.items, { id: '123', name: 'Product' }]
}));
```

### State Migration

```typescript
// Version 1 state structure
type UserStateV1 = { name: string };

// Version 2 state structure
type UserStateV2 = { firstName: string; lastName: string };

// Create store with migration
const userStore = stateManagerService.createStore<UserStateV2>('user', {
  initialState: { firstName: '', lastName: '' },
  version: 2,
  persistence: PersistenceStrategy.LOCAL,
  migrations: {
    // Migrate from v1 to v2
    1: (oldState: UserStateV1): UserStateV2 => {
      const [firstName, lastName] = oldState.name.split(' ');
      return { firstName, lastName: lastName || '' };
    }
  }
});
```

### Convenience Functions

```typescript
import { createDomain, getDomain, resetDomain } from '$lib/services/state';

// Create domain with shorthand
const store = createDomain('myDomain',
  { value: 0 },
  { persistence: PersistenceStrategy.SESSION }
);

// Get domain
const myStore = getDomain<MyState>('myDomain');

// Reset domain
resetDomain('myDomain');
```

### Safe Operations

```typescript
import { safeCreateStore, safeGetStore } from '$lib/services/state';

// Safe create (doesn't throw)
const result = safeCreateStore('user', {
  initialState: { id: '' }
});

if (result.success) {
  console.log('Store created:', result.data);
} else {
  console.error('Failed to create store:', result.error);
}

// Safe get (doesn't throw)
const getResult = safeGetStore<UserState>('user');
if (getResult.success) {
  const user = getResult.data.getValue();
}
```

### Property Updates

```typescript
const profileStore = stateManagerService.createStore('profile', {
  initialState: {
    name: 'John',
    email: 'john@example.com',
    age: 30,
    settings: { theme: 'light' }
  }
});

// Update single property
profileStore.updateProperty('age', 31);

// Update multiple properties
profileStore.setProperties({
  name: 'John Doe',
  email: 'johndoe@example.com'
});
```

## Integration Notes

- **Event System**: Integrates with the event bus for state change notifications
- **Secure Storage**: Uses secure storage utility for persistence
- **Error Handling**: Provides safe versions of methods that don't throw
- **Logging**: Uses logger service for debugging state changes
- **Immutability**: Encourages immutable update patterns
- **Singleton**: Single StateManager instance shared across the application
- **Type Safe**: Full TypeScript support with generics
