# SvelteKit Stores Documentation

This directory contains comprehensive documentation for all Svelte stores in the application. Each store manages a specific domain of application state.

## Store Categories

### Core Authentication & Authorization
- **[auth.store.md](./auth.store.md)** - Authentication state management (user, claims, auth method, loading)
- **[token.store.md](./token.store.md)** - Token state management (JWT tokens, decoded tokens, roles)
- **[rbac.store.md](./rbac.store.md)** - Role-Based Access Control (user roles and permissions)
- **[csrf.store.md](./csrf.store.md)** - CSRF token management and protection

### Event & Communication Systems
- **[event.store.md](./event.store.md)** - Event-connected stores integration (event ↔ store binding)
- **[event-bus.store.md](./event-bus.store.md)** - Simple event bus for app-wide communication
- **[pub-sub.store.md](./pub-sub.store.md)** - Publish-subscribe messaging system with topic routing

### UI State Management
- **[toast.store.md](./toast.store.md)** - Toast notification state and lifecycle
- **[loading.store.md](./loading.store.md)** - Loading states with context support
- **[route-handler.store.md](./route-handler.store.md)** - Current route and protection status

### Application Lifecycle
- **[initialization.store.md](./initialization.store.md)** - App and service initialization tracking
- **[state-manager.store.md](./state-manager.store.md)** - State domain registration and metadata
- **[tab-sync.store.md](./tab-sync.store.md)** - Multi-tab synchronization and coordination

### User & Security
- **[user-creation.store.md](./user-creation.store.md)** - User creation flow state
- **[recaptcha.store.md](./recaptcha.store.md)** - Google reCAPTCHA state and tokens
- **[secure-storage.store.md](./secure-storage.store.md)** - Encrypted storage configuration

### Development & Debugging
- **[logging.store.md](./logging.store.md)** - Logging state and performance timers

## Quick Reference

### Authentication Flow Stores
```
auth.store.ts → token.store.ts → rbac.store.ts
     ↓              ↓                ↓
  User data     JWT tokens       Roles/Perms
```

### Event Communication Stores
```
pub-sub.store.ts → Topic-based messaging
event-bus.store.ts → Event-based communication
event.store.ts → Svelte store ↔ event integration
```

### State Management Hierarchy
```
initialization.store.ts → Tracks all service init
     ↓
state-manager.store.ts → Tracks state domains
     ↓
Individual stores (auth, loading, etc.)
```

## Common Patterns

### Subscribe to Store
```typescript
import { storeName } from '$lib/stores/store-name';

storeName.subscribe($state => {
  console.log('State updated:', $state);
});
```

### Update Store
```typescript
import { storeName } from '$lib/stores/store-name';

storeName.update(state => ({
  ...state,
  field: newValue
}));
```

### Get Store Value (Non-Reactive)
```typescript
import { storeName } from '$lib/stores/store-name';
import { get } from 'svelte/store';

const currentValue = get(storeName);
```

### Reactive Store in Component
```svelte
<script>
  import { storeName } from '$lib/stores/store-name';
</script>

<div>
  {$storeName.someField}
</div>
```

## Store Integration Map

### Authentication Chain
- `auth.store.ts` ← Main auth state
- `token.store.ts` ← Token management
- `rbac.store.ts` ← Role checks
- `tab-sync.store.ts` ← Cross-tab sync
- `user-creation.store.ts` ← User creation

### UI State Chain
- `loading.store.ts` ← Loading indicators
- `toast.store.ts` ← Notifications
- `route-handler.store.ts` ← Current route
- `initialization.store.ts` ← Init status

### Event Communication Chain
- `pub-sub.store.ts` ← Topic messaging
- `event-bus.store.ts` ← Event emission
- `event.store.ts` ← Store-event binding

### Security Chain
- `csrf.store.ts` ← CSRF protection
- `recaptcha.store.ts` ← Bot protection
- `secure-storage.store.ts` ← Encrypted storage
- `rbac.store.ts` ← Access control

## Store Lifecycle

### Initialization Phase
1. `initialization.store.ts` - Start tracking
2. `state-manager.store.ts` - Register domains
3. Individual stores initialize
4. `initialization.store.ts` - Mark complete

### Runtime Phase
1. Stores update based on user actions
2. Events trigger store updates
3. Components react to store changes
4. Services update stores

### Cleanup Phase
1. Clear sensitive data (auth, token, csrf)
2. Reset UI state (loading, toast)
3. Clean up event subscriptions
4. Persist necessary state

## Best Practices

### General
1. Always unsubscribe when components unmount
2. Use derived stores for computed values
3. Keep store state minimal and normalized
4. Document store state interfaces
5. Use TypeScript for type safety

### Performance
1. Avoid frequent store updates in loops
2. Use derived stores to prevent redundant computations
3. Batch related updates when possible
4. Consider using context for component-local state

### Security
1. Clear sensitive stores on logout
2. Validate data before updating stores
3. Don't store secrets in client-side stores
4. Use server-side validation as source of truth

### Testing
1. Reset stores between tests
2. Mock store values in unit tests
3. Test store update logic independently
4. Verify event-store integrations

## File Naming Convention

- `*.store.ts` - Store implementation
- `*.store.md` - Store documentation
- `*.service.ts` - Service that uses stores (not documented here)

## Documentation Structure

Each store documentation includes:
- **Overview** - What state the store manages
- **Store Location** - File path
- **State Structure** - TypeScript interface
- **Key Methods/Fields** - Important functions and properties
- **Usage Examples** - Code examples for common operations
- **Integration Points** - Related stores and services
- **Best Practices** - Recommended patterns and tips

## Additional Resources

- [Svelte Store Documentation](https://svelte.dev/docs/svelte-store)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Architecture Guide](../../architecture/) - Application architecture patterns
- [Service Documentation](../../services/) - Service layer documentation
- [Type Documentation](../../types/) - TypeScript type definitions

## Contributing

When adding new stores:
1. Create the store in `src/lib/stores/`
2. Follow existing naming conventions
3. Add comprehensive documentation in `mcp/frontend/sveltekit/stores/`
4. Update this README with the new store
5. Add integration points to related store docs
6. Include usage examples and best practices
