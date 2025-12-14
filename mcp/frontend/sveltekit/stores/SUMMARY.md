# Store Documentation Summary

This document provides a quick reference for all 17 documented stores in the application.

## All Stores by Category

### Authentication & Security (5 stores)
| Store | Purpose | Key State |
|-------|---------|-----------|
| `auth.store.ts` | Main authentication state | `isAuthenticated`, `user`, `claims`, `authMethod` |
| `token.store.ts` | JWT token management | `token`, `decodedToken`, `roles` |
| `rbac.store.ts` | Role-based access control | `roles`, `permissions` |
| `csrf.store.ts` | CSRF protection | `token`, `validated` |
| `secure-storage.store.ts` | Encrypted storage config | `encrypted`, `namespace` |

### Event Systems (3 stores)
| Store | Purpose | Key State |
|-------|---------|-----------|
| `event.store.ts` | Event-store integration utilities | N/A (utility functions) |
| `event-bus.store.ts` | Simple event bus | `events`, `listeners` |
| `pub-sub.store.ts` | Topic-based messaging | `subscribers`, `messageCount` |

### UI & UX (3 stores)
| Store | Purpose | Key State |
|-------|---------|-----------|
| `toast.store.ts` | Toast notifications | `toasts`, `maxToasts` |
| `loading.store.ts` | Loading states | `global`, `contexts`, `activeOperations` |
| `route-handler.store.ts` | Current route tracking | `currentRoute`, `isProtected` |

### Application State (3 stores)
| Store | Purpose | Key State |
|-------|---------|-----------|
| `initialization.store.ts` | App initialization tracking | `isInitialized`, `services` |
| `state-manager.store.ts` | State domain registry | `domains`, `initialized` |
| `tab-sync.store.ts` | Multi-tab synchronization | `isPrimaryTab`, `knownTabs`, `isOnline` |

### User Management (2 stores)
| Store | Purpose | Key State |
|-------|---------|-----------|
| `user-creation.store.ts` | User creation flow | `isCreating`, `lastCreated`, `error` |
| `recaptcha.store.ts` | reCAPTCHA integration | `loaded`, `token` |

### Development (1 store)
| Store | Purpose | Key State |
|-------|---------|-----------|
| `logging.store.ts` | Logging & performance timers | `enabled`, `timers` |

## Quick Lookup by Use Case

### Need to check if user is logged in?
→ Use `auth.store.ts` - Check `isAuthenticated`

### Need to show a notification?
→ Use `toast.store.ts` - Publish `TOAST_SHOW` event

### Need to show loading spinner?
→ Use `loading.store.ts` - Call `startLoading()` / `endLoading()`

### Need to check user permissions?
→ Use `rbac.store.ts` - Check `roles` or `permissions`

### Need to emit/listen to events?
→ Use `event-bus.store.ts` or `pub-sub.store.ts`

### Need to protect form from CSRF?
→ Use `csrf.store.ts` - Get token with `getCsrfToken()`

### Need to track initialization?
→ Use `initialization.store.ts` - Check `isInitialized`

### Need to sync state across tabs?
→ Use `tab-sync.store.ts` - Check `isPrimaryTab`

### Need to protect route?
→ Use `route-handler.store.ts` - Check `isProtected`

### Need to store data securely?
→ Use `secure-storage.store.ts` - Set namespace and encryption

### Need to add reCAPTCHA to form?
→ Use `recaptcha.store.ts` - Execute and get token

### Need to create a new user?
→ Use `user-creation.store.ts` - Track creation status

### Need to log performance metrics?
→ Use `logging.store.ts` - Start/end timers

### Need to connect store to events?
→ Use `event.store.ts` - Use `eventStore()` or `eventDerived()`

### Need to manage domain state?
→ Use `state-manager.store.ts` - Register domains

## Store Dependencies Graph

```
initialization.store.ts (top-level)
  └── state-manager.store.ts (domain tracking)
      ├── auth.store.ts
      │   ├── token.store.ts
      │   ├── rbac.store.ts
      │   └── tab-sync.store.ts
      ├── loading.store.ts
      ├── toast.store.ts
      ├── route-handler.store.ts
      ├── csrf.store.ts
      ├── user-creation.store.ts
      ├── recaptcha.store.ts
      ├── secure-storage.store.ts
      └── logging.store.ts

Event Systems (independent)
  ├── event.store.ts (utilities)
  ├── event-bus.store.ts
  └── pub-sub.store.ts
```

## Common Operations

### Authentication Flow
```typescript
// 1. Check if initialized
if ($initialization.isInitialized) {
  // 2. Check auth status
  if ($auth.isAuthenticated) {
    // 3. Check user roles
    if ($rbac.roles.includes('admin')) {
      // User is admin
    }
  }
}
```

### Loading State
```typescript
// Start loading
loadingStore.startLoading('auth', 'login');

// Do work
await login();

// End loading
loadingStore.endLoading('auth', 'login');
```

### Show Notification
```typescript
import { publish } from '$lib/services/events';
import { CoreEventType } from '$lib/types/event.types';

publish(CoreEventType.TOAST_SHOW, {
  type: 'success',
  message: 'Operation successful'
});
```

### Emit Custom Event
```typescript
// Using event bus
eventBusService.emit('user:updated', { userId: '123' });

// Using pub-sub
pubSubService.publish('user.updated', { userId: '123' });
```

### Form Protection
```typescript
// 1. Get CSRF token
const csrfToken = await csrfProtection.getCsrfToken();

// 2. Execute reCAPTCHA
const recaptchaToken = await executeRecaptcha('submit');

// 3. Submit with both tokens
await submitForm(formData, csrfToken, recaptchaToken);
```

## Store File Locations

All stores are located in: `/Users/benjaminfoley/Documents/GitHub/boilerplate_frontend/src/lib/stores/`

All documentation is located in: `/Users/benjaminfoley/Documents/GitHub/boilerplate_frontend/mcp/frontend/sveltekit/stores/`

## Documentation Files Created

1. `auth.store.md` - Authentication state
2. `token.store.md` - Token management
3. `event.store.md` - Event integration
4. `toast.store.md` - Toast notifications
5. `loading.store.md` - Loading states
6. `state-manager.store.md` - State domains
7. `tab-sync.store.md` - Tab synchronization
8. `initialization.store.md` - App initialization
9. `logging.store.md` - Logging & timers
10. `csrf.store.md` - CSRF protection
11. `user-creation.store.md` - User creation
12. `event-bus.store.md` - Event bus
13. `pub-sub.store.md` - Pub-sub messaging
14. `rbac.store.md` - Role-based access
15. `recaptcha.store.md` - reCAPTCHA integration
16. `route-handler.store.md` - Route tracking
17. `secure-storage.store.md` - Secure storage
18. `README.md` - Main index (this file)
19. `SUMMARY.md` - Quick reference

## Total: 18 Documentation Files + 17 Stores

Each documentation file includes:
- Overview of what the store manages
- Complete TypeScript interface
- Key methods and properties
- Usage examples for common scenarios
- Integration points with other stores/services
- Best practices and patterns
