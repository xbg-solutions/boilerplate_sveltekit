# SvelteKit Services Documentation

Comprehensive documentation for all business logic services in the application.

Services encapsulate business logic, API integration, and complex operations, providing a clean interface for components to interact with backend systems and state management.

## Overview

Services are the business logic layer of the application, sitting between components/stores and external systems (APIs, Firebase, browser APIs, etc.).

### Service Responsibilities
- Encapsulate business logic
- Manage API communication
- Handle authentication flows
- Coordinate state updates
- Emit events for system changes
- Log operations
- Handle errors gracefully

### Service Design Principles
- **Single Responsibility**: Each service has one clear purpose
- **Dependency Injection**: Services can use other services
- **Error Handling**: All operations handle errors internally
- **Logging**: All significant operations are logged
- **Event-Driven**: Emit events for state changes
- **Type Safety**: Full TypeScript with strict types

## Services Index

### Core Services

#### [Authentication Service](./auth.md)
**Purpose**: User authentication and session management

**Key Features**:
- Email/password authentication
- Phone authentication
- Email link (passwordless) authentication
- Session management
- User claims and roles
- Multi-tab synchronization

**Key Functions**:
- `signInWithEmailAndPassword(email, password)`
- `signInWithPhoneNumber(phoneNumber)`
- `sendSignInLinkToEmail(email)`
- `signOut()`
- `getUser()`
- `getUserClaims()`

**Use When**: Authentication, user management, session handling

---

#### [API Service](./api.md)
**Purpose**: HTTP client for backend API communication

**Key Features**:
- RESTful API calls (GET, POST, PUT, DELETE, PATCH)
- Automatic CSRF protection
- Request/response interceptors
- Error handling and normalization
- Request deduplication
- Response caching integration

**Key Functions**:
- `get(url, options)`
- `post(url, data, options)`
- `put(url, data, options)`
- `delete(url, options)`
- `patch(url, data, options)`

**Use When**: Making API requests to backend

---

#### [Token Service](./token.md)
**Purpose**: JWT token management and validation

**Key Features**:
- Token storage and retrieval
- Token refresh logic
- Token validation
- Token decoding
- Automatic expiry handling

**Key Functions**:
- `getToken()`
- `setToken(token)`
- `refreshToken()`
- `decodeToken(token)`
- `isTokenValid(token)`
- `clearTokens()`

**Use When**: Managing JWT tokens, API authentication

---

#### [Toast Service](./toast.md)
**Purpose**: User notification system

**Key Features**:
- Success, error, warning, info notifications
- Configurable duration
- Action buttons
- Auto-dismiss
- Queue management
- Accessibility support

**Key Functions**:
- `success(message, options)`
- `error(message, options)`
- `warning(message, options)`
- `info(message, options)`
- `dismiss(id)`

**Use When**: Showing user notifications, feedback

---

### System Services

#### [Logging Service](./logging.md)
**Purpose**: Application logging and debugging

**Key Features**:
- Multiple log levels (debug, info, warn, error)
- Structured logging
- Performance timers
- Context tracking
- Production/development modes
- Log filtering

**Key Functions**:
- `debug(message, context)`
- `info(message, context)`
- `warn(message, context)`
- `error(message, context)`
- `startTimer(label)`
- `endTimer(label)`

**Use When**: Logging, debugging, performance monitoring

---

#### [Error Reporting Service](./error-reporting.md)
**Purpose**: Centralized error tracking and reporting

**Key Features**:
- Error capture and normalization
- Stack trace collection
- Context preservation
- Error deduplication
- Production error reporting
- Development error display

**Key Functions**:
- `reportError(error, context)`
- `captureException(exception)`
- `setContext(key, value)`
- `clearContext()`

**Use When**: Reporting errors, tracking issues

---

#### [Initialization Service](./initialization.md)
**Purpose**: Application startup and initialization

**Key Features**:
- Service initialization tracking
- Dependency resolution
- Startup sequencing
- Health checks
- Initialization state management

**Key Functions**:
- `initializeApp()`
- `registerService(name, initFn)`
- `isServiceReady(name)`
- `waitForService(name)`
- `getInitializationState()`

**Use When**: App startup, service initialization

---

#### [State Service](./state.md)
**Purpose**: State domain registration and management

**Key Features**:
- State domain registration
- State validation
- State metadata tracking
- Domain isolation
- State change tracking

**Key Functions**:
- `registerDomain(name, config)`
- `getDomain(name)`
- `updateDomain(name, updates)`
- `removeDomain(name)`
- `getAllDomains()`

**Use When**: Registering state domains, managing application state

---

### Communication Services

#### [Event Service](./events.md)
**Purpose**: Event-driven communication system

**Key Features**:
- Event emission and listening
- Type-safe events
- Event filtering
- Wildcard listeners
- Event history
- Unsubscribe management

**Key Functions**:
- `emit(event, data)`
- `on(event, handler)`
- `off(event, handler)`
- `once(event, handler)`
- `clear()`

**Use When**: Cross-component communication, system events

---

#### [Tab Sync Service](./tab-sync.md)
**Purpose**: Multi-tab/window synchronization

**Key Features**:
- Cross-tab state sync
- Tab coordination
- Leader election
- Storage-based messaging
- Tab lifecycle tracking

**Key Functions**:
- `syncState(key, value)`
- `broadcastEvent(event, data)`
- `onTabChange(handler)`
- `isLeaderTab()`
- `closeTab()`

**Use When**: Multi-tab synchronization, cross-tab communication

---

### File Services

#### [File Handling Service](./file-handling.md)
**Purpose**: File operations and management

**Key Features**:
- File validation
- Size/type checking
- File upload coordination
- Error handling
- Progress tracking

**Key Functions**:
- `validateFile(file, rules)`
- `prepareUpload(file, options)`
- `handleUploadError(error)`
- `getFileInfo(file)`

**Use When**: File validation, upload preparation

---

#### [File Upload Service](./file-upload.md)
**Purpose**: Firebase Storage file uploads

**Key Features**:
- Firebase Storage integration
- Upload progress tracking
- Resumable uploads
- URL generation
- Error handling

**Key Functions**:
- `uploadFile(file, path)`
- `getDownloadURL(path)`
- `deleteFile(path)`
- `onProgress(callback)`

**Use When**: Uploading files to Firebase Storage

---

#### [Caching Service](./caching.md)
**Purpose**: Response caching and optimization

**Key Features**:
- In-memory caching
- TTL-based expiration
- Cache invalidation
- Size limits
- LRU eviction

**Key Functions**:
- `cache(key, value, ttl)`
- `get(key)`
- `invalidate(key)`
- `clear()`
- `has(key)`

**Use When**: Caching API responses, optimizing performance

---

## Service Categories

### By Functionality

**Authentication & Security**:
- auth.md
- token.md

**API Communication**:
- api.md
- caching.md

**User Feedback**:
- toast.md
- error-reporting.md

**System Management**:
- logging.md
- initialization.md
- state.md

**File Operations**:
- file-handling.md
- file-upload.md

**Communication**:
- events.md
- tab-sync.md

## Service Dependency Map

### Primary Dependencies

```
authService
  ├─→ tokenService (token management)
  ├─→ apiService (API calls)
  ├─→ loggingService (logging)
  ├─→ eventService (auth events)
  └─→ tabSyncService (multi-tab sync)

apiService
  ├─→ tokenService (auth tokens)
  ├─→ loggingService (request logging)
  ├─→ cachingService (response caching)
  └─→ errorReportingService (error tracking)

toastService
  ├─→ eventService (toast events)
  └─→ loggingService (toast logging)

fileHandlingService
  ├─→ fileUploadService (upload coordination)
  ├─→ apiService (backend communication)
  └─→ loggingService (operation logging)

initializationService
  ├─→ loggingService (init logging)
  ├─→ stateService (state registration)
  └─→ eventService (init events)
```

### Integration with Stores

```
Services → Stores Integration:

authService
  ├─→ auth.store (user state)
  ├─→ token.store (tokens)
  └─→ rbac.store (roles/permissions)

tokenService
  ├─→ token.store (token state)
  └─→ csrf.store (CSRF tokens)

toastService
  └─→ toast.store (notifications)

loggingService
  └─→ logging.store (log state)

tabSyncService
  └─→ tab-sync.store (sync state)

initializationService
  └─→ initialization.store (init state)
```

## Common Usage Patterns

### Service Initialization Pattern

```typescript
// In +layout.svelte or app initialization
import { initializationService } from '$lib/services/initialization';
import { authService } from '$lib/services/auth';
import { loggingService } from '$lib/services/logging';

onMount(async () => {
  try {
    // Initialize services in order
    await loggingService.initialize();
    await authService.initialize();
    await initializationService.markReady();
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});
```

### API Request Pattern

```typescript
// Component makes API request via service
import { apiService } from '$lib/services/api';
import { toast } from '$lib/services/toast';
import { loggingService } from '$lib/services/logging';

async function fetchData() {
  try {
    const data = await apiService.get('/api/users');
    return data;
  } catch (error) {
    loggingService.error('Failed to fetch users', { error });
    toast.error('Unable to load users');
    throw error;
  }
}
```

### Authentication Flow Pattern

```typescript
// Login flow using auth service
import { authService } from '$lib/services/auth';
import { toast } from '$lib/services/toast';
import { goto } from '$app/navigation';

async function handleLogin(email: string, password: string) {
  try {
    const user = await authService.signInWithEmailAndPassword(email, password);
    toast.success(`Welcome back, ${user.displayName}!`);
    goto('/dashboard');
  } catch (error) {
    toast.error('Login failed. Please check your credentials.');
  }
}
```

### Event Communication Pattern

```typescript
// Service A emits event
import { eventService } from '$lib/services/events';

class MyService {
  async performAction() {
    // Do work
    const result = await this.doWork();

    // Notify other services
    eventService.emit('action:completed', { result });
  }
}

// Service B listens for event
class OtherService {
  initialize() {
    eventService.on('action:completed', (data) => {
      this.handleActionCompleted(data);
    });
  }
}
```

### File Upload Pattern

```typescript
// File upload via services
import { fileHandlingService } from '$lib/services/file-handling';
import { fileUploadService } from '$lib/services/file-upload';
import { toast } from '$lib/services/toast';

async function handleFileUpload(file: File) {
  // Validate file
  const validation = fileHandlingService.validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png']
  });

  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  // Upload file
  try {
    const url = await fileUploadService.uploadFile(file, 'uploads/');
    toast.success('File uploaded successfully!');
    return url;
  } catch (error) {
    toast.error('Upload failed');
    throw error;
  }
}
```

## Best Practices

### Service Design
1. **Single Responsibility**: Each service should have one clear purpose
2. **Dependency Injection**: Accept dependencies in constructor or init
3. **Error Handling**: Always handle and normalize errors
4. **Logging**: Log all significant operations
5. **Type Safety**: Use TypeScript interfaces for all parameters
6. **Testing**: Write unit tests for all business logic

### Service Usage
1. **Import from service layer**: `import { service } from '$lib/services/service'`
2. **Handle errors**: Always wrap service calls in try/catch
3. **Show feedback**: Use toast service for user notifications
4. **Log operations**: Use logging service for debugging
5. **Clean up**: Unsubscribe from events in component cleanup

### Performance
1. **Cache responses**: Use caching service for repeated requests
2. **Debounce calls**: Debounce frequent service calls
3. **Lazy initialization**: Initialize services only when needed
4. **Batch operations**: Batch multiple related operations
5. **Monitor performance**: Use logging service timers

### Security
1. **Validate inputs**: Validate all parameters before processing
2. **Sanitize data**: Sanitize user input before use
3. **Use CSRF**: API service automatically adds CSRF protection
4. **Handle tokens**: Use token service for secure token management
5. **Log security events**: Log authentication and authorization events

## Testing Services

### Unit Testing Pattern

```typescript
import { describe, it, expect, vi } from 'vitest';
import { MyService } from '$lib/services/my-service';

describe('MyService', () => {
  it('should perform operation successfully', async () => {
    const service = new MyService();
    const result = await service.doOperation();
    expect(result).toBe('expected');
  });

  it('should handle errors gracefully', async () => {
    const service = new MyService();
    await expect(service.failingOperation()).rejects.toThrow();
  });
});
```

### Integration Testing Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { authService } from '$lib/services/auth';
import { apiService } from '$lib/services/api';

describe('Auth Integration', () => {
  it('should authenticate and make API call', async () => {
    await authService.signIn('user@example.com', 'password');
    const data = await apiService.get('/api/protected');
    expect(data).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

**Service not initialized**:
```typescript
// Check initialization service
if (!initializationService.isServiceReady('auth')) {
  await initializationService.waitForService('auth');
}
```

**Circular dependencies**:
```typescript
// Use lazy initialization
let authService: AuthService;
export function getAuthService() {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}
```

**Memory leaks**:
```typescript
// Always clean up event listeners
onDestroy(() => {
  eventService.off('event', handler);
});
```

## File Locations

**Service Implementations**: `src/lib/services/`
**Service Documentation**: `mcp/frontend/sveltekit/services/`
**Service Tests**: `__tests__/services/`

## Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Firebase SDK Documentation](https://firebase.google.com/docs/web/setup)
- [Stores Documentation](../stores/README.md)
- [Utils Documentation](../utils/README.md)

---

**For detailed information on each service, see the individual service documentation files listed above.**

Last updated: 2025-12-14
