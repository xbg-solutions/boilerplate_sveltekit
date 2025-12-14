# SvelteKit Architecture Documentation

Comprehensive documentation for all SvelteKit-specific components, services, utilities, and stores in the boilerplate.

This documentation is optimized for AI agent consumption and provides structured, actionable information for building features with the SvelteKit 5 boilerplate.

## Directory Structure

```
sveltekit/
├── README.md              # This file - SvelteKit architecture index
├── services/              # Business logic and API integration
│   ├── README.md         # Service documentation index
│   ├── api.md            # HTTP client and API integration
│   ├── auth.md           # Authentication service
│   ├── caching.md        # Response caching service
│   ├── error-reporting.md # Error reporting service
│   ├── events.md         # Event-driven communication
│   ├── file-handling.md  # File upload/download service
│   ├── file-upload.md    # File upload utilities
│   ├── initialization.md # App initialization service
│   ├── logging.md        # Logging service
│   ├── state.md          # State management service
│   ├── tab-sync.md       # Multi-tab synchronization
│   ├── toast.md          # Toast notification service
│   └── token.md          # Token management service
├── utils/                 # Utility functions and helpers
│   ├── README.md         # Utils documentation index
│   ├── auth-guard.md     # Route protection utilities
│   ├── browser.md        # Browser detection
│   ├── cache-helpers.md  # Caching utilities
│   ├── cn.md             # Class name utility
│   ├── csrf.md           # CSRF protection
│   ├── error-handler.md  # Error handling utilities
│   ├── error-handler-toast.md # Toast error integration
│   ├── error-testing.md  # Error testing utilities
│   ├── firebase.md       # Firebase initialization
│   ├── firebase-storage.md # Firebase Storage utilities
│   ├── mutex.md          # Concurrency control
│   ├── performance.md    # Performance monitoring
│   ├── rbac.md           # Role-based access control
│   ├── recaptcha.md      # reCAPTCHA integration
│   ├── route-handler.md  # Route protection
│   ├── sanitizer.md      # Input sanitization
│   ├── secure-storage.md # Secure storage wrapper
│   ├── seo.md            # SEO utilities
│   ├── signout.md        # Signout utilities
│   ├── sse.md            # Server-Sent Events
│   └── tokens.md         # JWT token utilities
├── stores/                # Svelte stores for state management
│   ├── README.md         # Store documentation index
│   ├── auth.store.md     # Authentication state
│   ├── csrf.store.md     # CSRF token state
│   ├── event.store.md    # Event-store integration
│   ├── event-bus.store.md # Event bus state
│   ├── initialization.store.md # Initialization state
│   ├── loading.store.md  # Loading indicators
│   ├── logging.store.md  # Logging state
│   ├── pub-sub.store.md  # Pub-sub messaging
│   ├── rbac.store.md     # RBAC state
│   ├── recaptcha.store.md # reCAPTCHA state
│   ├── route-handler.store.md # Route state
│   ├── secure-storage.store.md # Storage config
│   ├── state-manager.store.md # State domain registry
│   ├── tab-sync.store.md # Tab sync state
│   ├── toast.store.md    # Toast notifications
│   ├── token.store.md    # Token state
│   └── user-creation.store.md # User creation flow
└── components/            # Component documentation
    ├── README.md         # Component documentation index
    └── overview.md       # Component library reference
```

## Architecture Overview

### Layered Architecture

The SvelteKit application follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Components Layer            │  UI components (SHADCN atomic)
├─────────────────────────────────────┤
│           Stores Layer              │  Reactive state management
├─────────────────────────────────────┤
│          Services Layer             │  Business logic & API
├─────────────────────────────────────┤
│          Utilities Layer            │  Helper functions
└─────────────────────────────────────┘
```

### Data Flow

```
User Interaction
    ↓
Component (Svelte)
    ↓
Store (Reactive State)
    ↓
Service (Business Logic)
    ↓
Utility (Helper Functions)
    ↓
API / Backend
```

### State Management Flow

```
Component subscribes to Store
    ↓
Store updates from Service
    ↓
Service calls API/Backend
    ↓
Response flows back up
    ↓
Component re-renders (reactive)
```

## Quick Reference

### Services

Business logic services that encapsulate functionality:

| Service | Purpose | Key Functions |
|---------|---------|---------------|
| [auth](./services/auth.md) | User authentication | `signIn`, `signOut`, `getUser` |
| [api](./services/api.md) | HTTP client | `get`, `post`, `put`, `delete` |
| [toast](./services/toast.md) | Notifications | `success`, `error`, `info`, `warning` |
| [logging](./services/logging.md) | Application logs | `info`, `error`, `warn`, `debug` |
| [events](./services/events.md) | Event system | `emit`, `on`, `off` |
| [file-handling](./services/file-handling.md) | File operations | `upload`, `download` |
| [initialization](./services/initialization.md) | App startup | `initializeApp`, `isReady` |
| [token](./services/token.md) | JWT tokens | `getToken`, `refreshToken` |
| [state](./services/state.md) | State domains | `registerDomain`, `getDomain` |
| [caching](./services/caching.md) | Response cache | `cache`, `invalidate` |
| [error-reporting](./services/error-reporting.md) | Error tracking | `reportError` |
| [tab-sync](./services/tab-sync.md) | Multi-tab sync | `syncState`, `broadcastEvent` |

### Utilities

Helper functions for common operations:

| Utility | Purpose | Key Functions |
|---------|---------|---------------|
| [error-handler](./utils/error-handler.md) | Error handling | `normalizeError`, `handleError` |
| [sanitizer](./utils/sanitizer.md) | Input sanitization | `sanitize`, `inputSanitizer` |
| [auth-guard](./utils/auth-guard.md) | Route protection | `requireAuth`, `checkClaims` |
| [rbac](./utils/rbac.md) | Access control | `hasRole`, `hasPermission` |
| [csrf](./utils/csrf.md) | CSRF protection | `protectRequest`, `validateToken` |
| [route-handler](./utils/route-handler.md) | Load functions | `createLoadFunction` |
| [cn](./utils/cn.md) | Class names | `cn` (merge classes) |
| [firebase](./utils/firebase.md) | Firebase init | `initializeFirebase` |
| [firebase-storage](./utils/firebase-storage.md) | Storage ops | `uploadFile`, `getDownloadURL` |
| [performance](./utils/performance.md) | Performance | `recordMetric`, `measureTime` |
| [mutex](./utils/mutex.md) | Concurrency | `acquire`, `release` |
| [browser](./utils/browser.md) | Environment | `isBrowser` |

### Stores

Reactive state stores:

| Store | Purpose | Key State |
|-------|---------|-----------|
| [auth](./stores/auth.store.md) | Auth state | `user`, `isAuthenticated`, `claims` |
| [token](./stores/token.store.md) | Token state | `accessToken`, `refreshToken` |
| [loading](./stores/loading.store.md) | Loading indicators | `isLoading`, `context` |
| [toast](./stores/toast.store.md) | Notifications | `toasts`, `activeToast` |
| [csrf](./stores/csrf.store.md) | CSRF tokens | `token`, `isValid` |
| [rbac](./stores/rbac.store.md) | Roles/permissions | `roles`, `permissions` |
| [route-handler](./stores/route-handler.store.md) | Current route | `route`, `isProtected` |
| [initialization](./stores/initialization.store.md) | Init status | `isInitialized`, `services` |
| [tab-sync](./stores/tab-sync.store.md) | Tab coordination | `activeTab`, `syncData` |
| [event-bus](./stores/event-bus.store.md) | Event comm | `events`, `emit` |
| [pub-sub](./stores/pub-sub.store.md) | Topic messaging | `topics`, `publish`, `subscribe` |

### Components

UI components (SHADCN-based):

See [components/README.md](./components/README.md) for complete component documentation.

**Key Component Categories:**
- Form Components (Button, Input, Select, Checkbox, etc.)
- Layout Components (Card, Dialog, Sheet, Tabs, etc.)
- Navigation Components (Breadcrumb, Pagination, etc.)
- Feedback Components (Toast, Alert, Progress, etc.)
- Data Display Components (Table, Badge, Avatar, etc.)

## Common Integration Patterns

### Authentication Flow

```typescript
// 1. Component uses auth service
import { authService } from '$lib/services/auth';

// 2. Service updates auth store
const user = await authService.signIn(email, password);

// 3. Store triggers reactivity
// Components subscribed to authStore automatically update

// 4. Protected routes check auth state
// route-handler utility uses auth store for protection
```

### API Request Flow

```typescript
// 1. Component calls service
import { apiService } from '$lib/services/api';

// 2. Service adds CSRF protection
// csrf utility automatically adds token

// 3. API service makes request
const data = await apiService.get('/api/users');

// 4. Error handling via error-handler
// Errors normalized and reported

// 5. Success updates store
userStore.set(data);
```

### Toast Notification Flow

```typescript
// 1. Error occurs in service
try {
  await apiService.post('/api/data', payload);
} catch (error) {
  // 2. Error handler normalizes
  const appError = normalizeError(error);

  // 3. Toast service displays
  toast.error(appError.message);

  // 4. Toast store updates
  // Component shows toast notification
}
```

### State Management Flow

```typescript
// 1. Register state domain
stateService.registerDomain('users', {
  initialState: [],
  validators: [...]
});

// 2. Create store for domain
const usersStore = writable([]);

// 3. Service updates store
usersStore.update(state => [...state, newUser]);

// 4. Component subscribes
$: users = $usersStore;
```

## Dependency Relationships

### Services Dependencies

```
authService
  ├─→ tokenService
  ├─→ apiService
  ├─→ loggingService
  └─→ eventService

apiService
  ├─→ csrfUtil
  ├─→ errorHandler
  └─→ cachingService

toastService
  ├─→ eventService
  └─→ loggingService

fileHandlingService
  ├─→ apiService
  ├─→ firebaseStorage
  └─→ loggingService
```

### Store Dependencies

```
auth.store
  ├─→ token.store
  ├─→ rbac.store
  └─→ tab-sync.store

token.store
  ├─→ csrf.store
  └─→ secure-storage.store

loading.store
  ├─→ route-handler.store
  └─→ initialization.store

toast.store
  ├─→ event-bus.store
  └─→ pub-sub.store
```

### Utility Dependencies

```
route-handler
  ├─→ auth-guard
  ├─→ rbac
  └─→ error-handler

auth-guard
  ├─→ rbac
  └─→ csrf

sanitizer
  └─→ error-handler

firebase-storage
  ├─→ firebase
  └─→ error-handler
```

## File Locations

All documented code is located in:

```
src/lib/
├── services/          # Service implementations
├── utils/             # Utility functions
├── stores/            # Svelte stores
└── components/        # Svelte components
```

Documentation is located in:

```
mcp/frontend/sveltekit/
├── services/          # Service documentation
├── utils/             # Utility documentation
├── stores/            # Store documentation
└── components/        # Component documentation
```

## Usage Guidelines

### For Human Developers

1. **Browse by layer**: Start with services, then stores, then components
2. **Follow patterns**: Each documentation shows common patterns
3. **Check integration points**: See how pieces connect
4. **Read best practices**: Each doc includes recommendations

### For AI Agents

1. **Use decision trees**: Quick component/service selection
2. **Follow import patterns**: Consistent imports from `$lib/`
3. **Copy code examples**: Patterns are production-ready
4. **Check dependencies**: Understand integration requirements

### Code Generation Guidelines

When generating code:

1. **Import correctly**:
```typescript
// Components
import { Button, Card } from '$lib/components/ui';

// Services
import { authService } from '$lib/services/auth';

// Stores
import { authStore } from '$lib/stores/auth';

// Utils
import { normalizeError } from '$lib/utils/error-handler';

// Config
import { APP_CONFIG } from '$lib/config/app.config';
```

2. **Follow patterns**:
- Services for business logic
- Stores for reactive state
- Utils for pure functions
- Components for UI

3. **Handle errors**:
```typescript
try {
  await service.operation();
} catch (error) {
  const appError = normalizeError(error);
  toast.error(appError.message);
  loggingService.error('Operation failed', { error });
}
```

4. **Protect routes**:
```typescript
// +page.ts
export const load = routeHandler.createLoadFunction(
  () => authService.getAuthState(),
  { requireAuth: true }
);
```

5. **Test behavior**:
```typescript
test('user can submit form', async () => {
  render(MyComponent);
  await userEvent.type(screen.getByLabelText('Name'), 'John');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

## Best Practices

### Service Design
- Single responsibility per service
- Return typed results
- Handle errors internally
- Log all operations
- Emit events for state changes

### Store Design
- Keep state minimal
- Use derived stores for computations
- Clear sensitive data on logout
- Document state shape
- Provide type definitions

### Utility Design
- Pure functions when possible
- No side effects
- Well-documented parameters
- Comprehensive error handling
- Unit testable

### Component Design
- Use atomic SHADCN components
- Keep business logic in services
- Subscribe to stores for state
- Handle loading/error states
- Ensure accessibility

## Testing Strategies

### Service Testing
- Mock external dependencies
- Test business logic flows
- Verify error handling
- Check event emissions
- Validate state updates

### Store Testing
- Test state updates
- Verify derived calculations
- Check subscriptions
- Test cleanup
- Validate persistence

### Utility Testing
- Test pure functions
- Edge cases and errors
- Input validation
- Type safety
- Performance

### Component Testing
- Test user interactions
- Verify rendering
- Check accessibility
- Test error states
- Validate props

## Performance Considerations

### Service Optimization
- Cache API responses
- Debounce frequent calls
- Use request deduplication
- Implement retry logic
- Monitor performance metrics

### Store Optimization
- Avoid frequent updates
- Use derived stores
- Batch related updates
- Clean up subscriptions
- Minimize state size

### Utility Optimization
- Memoize expensive operations
- Use efficient algorithms
- Avoid blocking operations
- Profile critical paths
- Optimize bundle size

## Security Considerations

### Service Security
- Validate all inputs
- Sanitize user data
- Use CSRF protection
- Implement rate limiting
- Log security events

### Store Security
- Clear sensitive data
- Encrypt when necessary
- Validate state updates
- Prevent XSS attacks
- Use secure storage

### Utility Security
- Sanitize inputs
- Validate outputs
- Prevent injection attacks
- Use secure defaults
- Follow OWASP guidelines

## Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Store API](https://svelte.dev/docs/svelte-store)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vitest Documentation](https://vitest.dev/)

---

**Next Steps:**
- [Services Documentation](./services/README.md)
- [Utils Documentation](./utils/README.md)
- [Stores Documentation](./stores/README.md)
- [Components Documentation](./components/README.md)

Last updated: 2025-12-14
