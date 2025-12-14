# State Manager Store

## Overview
Tracks state domains and their metadata throughout the application. Provides centralized tracking of which state domains are registered and their initialization status.

## Store Location
`src/lib/stores/state-manager.store.ts`

## State Structure

```typescript
interface StateManagerState {
  domains: Record<string, StateDomainMeta>; // Map of domain metadata
  initialized: boolean;                      // Whether state manager is initialized
  error?: Error;                             // Any error during initialization
}

interface StateDomainMeta {
  name: string;                // Domain name (e.g., 'auth', 'user', 'settings')
  version?: string;            // Domain version
  initialized: boolean;        // Whether domain is initialized
  lastModified?: number;       // Last modification timestamp
  // Additional domain-specific metadata
}
```

## Usage Examples

### Subscribe to State Manager
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

stateManagerStore.subscribe($stateManager => {
  console.log('Registered domains:', Object.keys($stateManager.domains));
  console.log('Initialized:', $stateManager.initialized);
});
```

### Register a Domain
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

stateManagerStore.update(state => ({
  ...state,
  domains: {
    ...state.domains,
    auth: {
      name: 'auth',
      version: '1.0.0',
      initialized: true,
      lastModified: Date.now()
    }
  }
}));
```

### Check Domain Status
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';
import { get } from 'svelte/store';

const $state = get(stateManagerStore);
const authDomain = $state.domains['auth'];

if (authDomain && authDomain.initialized) {
  console.log('Auth domain is ready');
}
```

### Mark as Initialized
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

stateManagerStore.update(state => ({
  ...state,
  initialized: true
}));
```

### Handle Initialization Error
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

stateManagerStore.update(state => ({
  ...state,
  error: new Error('Failed to initialize state manager'),
  initialized: false
}));
```

### Update Domain Metadata
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

stateManagerStore.update(state => {
  const domains = { ...state.domains };

  if (domains['user']) {
    domains['user'] = {
      ...domains['user'],
      lastModified: Date.now(),
      version: '1.1.0'
    };
  }

  return { ...state, domains };
});
```

## Integration Points

- **State Management Service** - Registers and tracks state domains
- **Initialization Service** - Checks domain initialization status
- **All Stores** - Can register themselves as state domains
- **Debug Tools** - View all registered domains and their status

## Common State Domains

Typical domains registered in the state manager:

- **auth** - Authentication state domain
- **user** - User profile state domain
- **settings** - Application settings domain
- **notifications** - Notification state domain
- **cache** - Cache state domain
- **ui** - UI state domain

## Use Cases

### Tracking Initialization
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';
import { derived } from 'svelte/store';

// Check if all domains are initialized
const allDomainsReady = derived(stateManagerStore, $state => {
  if (!$state.initialized) return false;

  return Object.values($state.domains).every(domain => domain.initialized);
});
```

### Domain Health Check
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

function checkDomainHealth() {
  const $state = get(stateManagerStore);

  const unhealthyDomains = Object.values($state.domains)
    .filter(domain => !domain.initialized);

  if (unhealthyDomains.length > 0) {
    console.warn('Uninitialized domains:', unhealthyDomains);
  }
}
```

### Debugging Domain Status
```typescript
import { stateManagerStore } from '$lib/stores/state-manager.store';

stateManagerStore.subscribe($state => {
  console.log('State Manager Status:', {
    initialized: $state.initialized,
    domainCount: Object.keys($state.domains).length,
    domains: Object.entries($state.domains).map(([name, meta]) => ({
      name,
      initialized: meta.initialized,
      version: meta.version
    }))
  });
});
```

## Best Practices

1. Register domains during service initialization
2. Update `lastModified` when domain state changes significantly
3. Use semantic versioning for domain versions
4. Check domain initialization before using domain features
5. Handle initialization errors gracefully
6. Use domain names consistently across the application
7. Keep domain metadata lightweight
