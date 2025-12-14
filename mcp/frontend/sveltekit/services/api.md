# API Service

## Overview

The API Service is a centralized HTTP client for making API requests with comprehensive error handling, automatic retries, and request deduplication. It provides type-safe methods for all HTTP verbs and integrates seamlessly with the authentication system.

**Location:** `src/lib/services/api/api.service.ts`

## Key Features

- Type-safe HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Safe variants that never throw exceptions
- Automatic retry logic with exponential backoff
- Request deduplication for GET requests
- Authentication and CSRF protection
- Event publishing for monitoring
- Configurable timeouts and retry counts

## Core Methods

### Standard HTTP Methods

These methods throw errors on failure:

#### `get<T>(url: string, options?: RequestOptions): Promise<T>`

Performs a GET request with automatic deduplication.

```typescript
const user = await apiService.get<User>('/api/users/123');
const users = await apiService.get<User[]>('/api/users', {
  params: { page: 1, limit: 10 }
});
```

#### `post<T>(url: string, data?: any, options?: RequestOptions): Promise<T>`

Performs a POST request.

```typescript
const newUser = await apiService.post<User>('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

#### `put<T>(url: string, data?: any, options?: RequestOptions): Promise<T>`

Performs a PUT request for full resource updates.

```typescript
const updatedUser = await apiService.put<User>('/api/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

#### `patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T>`

Performs a PATCH request for partial resource updates.

```typescript
const updatedUser = await apiService.patch<User>('/api/users/123', {
  name: 'Jane Doe'
});
```

#### `delete<T>(url: string, options?: RequestOptions): Promise<T>`

Performs a DELETE request.

```typescript
await apiService.delete('/api/users/123');
```

### Safe HTTP Methods

These methods return a result object instead of throwing:

#### `safeGet<T>(url: string, options?: RequestOptions): Promise<SafeRequestResult<T>>`

Safe variant of GET that never throws.

```typescript
const result = await apiService.safeGet<User>('/api/users/123');

if (result.success) {
  console.log('User:', result.data);
} else {
  console.error('Error:', result.error);
}
```

#### `safePost<T>()`, `safePut<T>()`, `safePatch<T>()`, `safeDelete<T>()`

Similar safe variants for other HTTP methods.

```typescript
const result = await apiService.safePost<User>('/api/users', userData);

if (result.success) {
  // Handle success
  const user = result.data;
} else {
  // Handle error without try/catch
  const error = result.error;
}
```

## Request Options

The `RequestOptions` interface provides configuration for requests:

```typescript
interface RequestOptions {
  params?: Record<string, any>;        // Query parameters
  headers?: Record<string, string>;    // Custom headers
  timeout?: number;                    // Request timeout (ms)
  retryCount?: number;                 // Max retry attempts
  skipDeduplication?: boolean;         // Disable request deduplication
}
```

### Examples

```typescript
// Custom timeout
await apiService.get<Data>('/api/data', {
  timeout: 5000
});

// Disable retries
await apiService.post<Result>('/api/action', data, {
  retryCount: 0
});

// Skip deduplication for GET
await apiService.get<Data>('/api/realtime', {
  skipDeduplication: true
});

// Custom headers
await apiService.get<Data>('/api/data', {
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

## Request/Response Handling

### Request Processing

The API Service delegates request preparation to the **Request Handler**:

1. **URL Building**: Query parameters are appended to URLs
2. **Header Setup**: Adds authentication, CSRF, and content-type headers
3. **Body Serialization**: Converts data to JSON format
4. **Token Management**: Automatically includes authentication tokens

### Response Processing

The **Response Handler** manages response processing:

1. **Status Validation**: Checks HTTP status codes
2. **Body Parsing**: Parses JSON responses
3. **Error Extraction**: Extracts error details from responses
4. **Type Conversion**: Converts responses to expected types

## Error Handling

### Error Types

The service uses typed errors from the error handler:

- `ApiError`: General API errors (4xx, 5xx responses)
- `AuthError`: Authentication failures (401, 403)
- `NetworkError`: Network connectivity issues
- `ValidationError`: Request validation failures

### Automatic Retry Logic

Failed requests are automatically retried with:

- **Exponential Backoff**: Delay increases with each retry
- **Jitter**: Random delay variation to prevent thundering herd
- **Configurable Attempts**: Default 3 retries, customizable per request
- **Selective Retrying**: Only retries network errors and 5xx server errors

```typescript
// Retry logic with exponential backoff
const delay = retryDelay * Math.pow(2, retryCount - 1) * (0.8 + Math.random() * 0.4);
```

### Token Refresh Handling

When a request fails due to token expiration:

1. The service automatically attempts token refresh
2. Original request is retried with the new token
3. Process is transparent to the caller

## Request Deduplication

GET requests are automatically deduplicated to prevent redundant calls:

```typescript
// Both calls will use the same underlying request
const request1 = apiService.get<User>('/api/users/123');
const request2 = apiService.get<User>('/api/users/123');

// Both promises resolve with the same result
const [user1, user2] = await Promise.all([request1, request2]);
```

Disable deduplication when needed:

```typescript
await apiService.get<Data>('/api/realtime', {
  skipDeduplication: true
});
```

## Event Publishing

The service publishes events for monitoring and debugging:

- `REQUEST_START`: When a request begins
- `REQUEST_SUCCESS`: When a request succeeds
- `REQUEST_ERROR`: When a request fails
- `AUTH_ERROR`: When authentication fails
- `NETWORK_ERROR`: When network issues occur

```typescript
// Subscribe to events (in your app)
import { subscribe } from '$lib/services/events';

subscribe('api:request:success', (event) => {
  console.log('Request completed:', event.url, event.duration);
});
```

## Integration Examples

### With Svelte Stores

```typescript
import { writable } from 'svelte/store';
import { apiService } from '$lib/services/api/api.service';

async function loadUsers() {
  const users = writable<User[]>([]);

  const result = await apiService.safeGet<User[]>('/api/users');

  if (result.success) {
    users.set(result.data);
  }

  return users;
}
```

### With SvelteKit Load Functions

```typescript
import { apiService } from '$lib/services/api/api.service';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const result = await apiService.safeGet<User[]>('/api/users');

  if (!result.success) {
    throw error(500, result.error.message);
  }

  return {
    users: result.data
  };
};
```

### Error Boundary Pattern

```typescript
async function handleSubmit(data: FormData) {
  try {
    const result = await apiService.post<User>('/api/users', data);
    // Handle success
  } catch (error) {
    if (error instanceof AuthError) {
      // Redirect to login
    } else if (error instanceof ValidationError) {
      // Show validation errors
    } else {
      // Show generic error
    }
  }
}
```

### Using Safe Methods

```typescript
async function loadDashboard() {
  // Multiple safe requests in parallel
  const [usersResult, statsResult, notificationsResult] = await Promise.all([
    apiService.safeGet<User[]>('/api/users'),
    apiService.safeGet<Stats>('/api/stats'),
    apiService.safeGet<Notification[]>('/api/notifications')
  ]);

  return {
    users: usersResult.success ? usersResult.data : [],
    stats: statsResult.success ? statsResult.data : null,
    notifications: notificationsResult.success ? notificationsResult.data : [],
    errors: {
      users: usersResult.success ? null : usersResult.error,
      stats: statsResult.success ? null : statsResult.error,
      notifications: notificationsResult.success ? null : notificationsResult.error
    }
  };
}
```

## Best Practices

1. **Use Safe Methods**: Prefer `safeGet`, `safePost`, etc. for optional data
2. **Type Your Responses**: Always provide generic type parameter for type safety
3. **Handle Errors Appropriately**: Different error types require different handling
4. **Configure Timeouts**: Set appropriate timeouts for long-running operations
5. **Avoid Deduplication When Needed**: Disable for real-time or unique requests
6. **Monitor Events**: Subscribe to events for logging and analytics

## Configuration

Default configuration from `API_CONSTANTS`:

```typescript
{
  timeout: 30000,        // 30 second timeout
  retryCount: 3,         // 3 retry attempts
  retryDelay: 1000       // 1 second base delay
}
```

Override per request or globally by modifying constants.

## Related Services

- **Request Handler**: Prepares and executes HTTP requests
- **Response Handler**: Processes and validates responses
- **Token Service**: Manages authentication tokens
- **Event Service**: Publishes and subscribes to events
- **Logger Service**: Logs API operations

## Type Definitions

See `src/lib/types/api.types.ts` for complete type definitions.
