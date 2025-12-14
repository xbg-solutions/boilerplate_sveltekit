# Error Handler Utility

## Overview

Centralized error handling utility for application-wide error management with support for custom error classes, error categorization, environment-specific formatting, and integration with the logging service.

**Location:** `src/lib/utils/error-handler.ts`

## Key Features

- Custom error classes for different error types (API, Validation, Auth, Network, Application)
- Error normalization from unknown types to AppError instances
- Environment-specific error formatting and sanitization
- Integration with SvelteKit's error handling mechanism
- Support for error context and metadata
- User-friendly error messages
- Safe error wrapping functions

## Error Classes

### AppError (Base Class)

Base application error class that all other error types extend.

**Properties:**
- `category: string` - Error category
- `statusCode?: number` - HTTP status code if applicable
- `context?: Record<string, any>` - Additional context
- `userVisible: boolean` - Whether error should be shown to user
- `userMessage?: string` - User-friendly message for UI display
- `code?: string` - Error code for client-side handling
- `containsSensitiveInfo: boolean` - Whether error contains sensitive data
- `cause?: Error` - Original error that caused this error

```typescript
const error = new AppError('Something went wrong', {
  category: 'application',
  statusCode: 500,
  userMessage: 'Please try again later',
  context: { userId: '123' }
});
```

### ApiError

API-related errors (network, HTTP, etc.)

**Additional Properties:**
- `endpoint?: string` - API endpoint being accessed
- `method?: string` - HTTP method being used
- `apiStatusCode?: number` - Response status code from API
- `responseData?: any` - Response data if available

```typescript
const error = new ApiError('Request failed', {
  endpoint: '/api/users',
  method: 'POST',
  apiStatusCode: 400,
  responseData: { message: 'Invalid request' }
});
```

### ValidationError

Validation errors for form inputs and data validation.

**Additional Properties:**
- `field?: string` - Field that failed validation
- `rule?: string` - Validation rule that failed
- `fieldErrors?: Record<string, string>` - Map of field names to error messages

```typescript
const error = new ValidationError('Email is required', {
  field: 'email',
  rule: 'required',
  fieldErrors: {
    email: 'Email is required',
    password: 'Password must be at least 8 characters'
  }
});
```

### AuthError

Authentication and authorization errors.

**Additional Properties:**
- `action?: 'login' | 'logout' | 'register' | 'verify' | 'reset' | 'authorize'`

```typescript
const error = new AuthError('Unauthorized access', {
  action: 'authorize',
  statusCode: 403,
  userMessage: 'You do not have permission to access this resource'
});
```

### NetworkError

Network-related errors.

**Additional Properties:**
- `isTimeout?: boolean` - Whether error was due to timeout
- `isOffline?: boolean` - Whether error was due to offline status

```typescript
const error = new NetworkError('Connection failed', {
  isTimeout: true,
  userMessage: 'The request timed out. Please try again.'
});
```

### ApplicationError

General application errors.

```typescript
const error = new ApplicationError('Internal error', {
  statusCode: 500,
  context: { module: 'payment-processing' }
});
```

## Key Functions

### normalizeError

Converts any caught error to an AppError instance.

```typescript
function normalizeError(
  error: unknown,
  fallbackMessage?: string,
  options?: ErrorOptions
): AppError
```

**Usage:**
```typescript
try {
  // some operation
} catch (error) {
  const appError = normalizeError(error, 'Operation failed', {
    category: 'database',
    context: { operation: 'query' }
  });
}
```

### formatError

Formats an error for display/logging with appropriate detail level based on environment.

```typescript
function formatError(
  error: Error | AppError,
  includeDetails?: boolean
): FormattedError
```

**Usage:**
```typescript
const formatted = formatError(error, import.meta.env.DEV);
console.log(formatted.message); // User-safe message
if (formatted.stack) {
  console.log(formatted.stack); // Only in dev
}
```

### handleError

Main error handler function for the application. Logs the error and returns formatted information.

```typescript
function handleError(
  error: unknown,
  context?: LogContext
): FormattedError
```

**Usage:**
```typescript
try {
  await riskyOperation();
} catch (error) {
  const formatted = handleError(error, {
    module: 'user-management',
    userId: currentUser.id
  });
  // Error is automatically logged
}
```

### createErrorResponse

Creates a SvelteKit-compatible error response for use in load functions and actions.

```typescript
function createErrorResponse(
  error: unknown,
  options?: { redirect?: string }
): App.Error
```

**Usage:**
```typescript
// In +page.server.ts
export async function load() {
  try {
    const data = await fetchData();
    return { data };
  } catch (error) {
    throw createErrorResponse(error, {
      redirect: '/login'
    });
  }
}
```

### tryCatch

Helper function to safely try an operation and handle errors.

```typescript
async function tryCatch<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | undefined>
```

**Usage:**
```typescript
const result = await tryCatch(
  async () => await fetchUserData(),
  (error) => {
    console.error('Fetch failed:', error.message);
  }
);

if (result) {
  // Use result
}
```

### withErrorHandling

Creates a function that catches errors from another function and returns a result object.

```typescript
function withErrorHandling<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>
): (...args: Args) => Promise<{
  success: boolean;
  data?: T;
  error?: AppError
}>
```

**Usage:**
```typescript
const safeLogin = withErrorHandling(loginUser);

const result = await safeLogin(email, password);
if (result.success) {
  console.log('Logged in:', result.data);
} else {
  console.error('Login failed:', result.error?.message);
}
```

## Common Usage Patterns

### In Load Functions

```typescript
// +page.server.ts
export async function load({ fetch }) {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new ApiError('Failed to fetch data', {
        apiStatusCode: response.status,
        endpoint: '/api/data'
      });
    }
    return { data: await response.json() };
  } catch (error) {
    throw createErrorResponse(error);
  }
}
```

### In Form Actions

```typescript
// +page.server.ts
export const actions = {
  default: async ({ request }) => {
    try {
      const formData = await request.formData();
      const email = formData.get('email');

      if (!email) {
        throw new ValidationError('Email is required', {
          field: 'email',
          rule: 'required'
        });
      }

      // Process form...
      return { success: true };
    } catch (error) {
      const formatted = handleError(error);
      return {
        success: false,
        error: formatted.userMessage || formatted.message
      };
    }
  }
};
```

### In API Calls

```typescript
async function callAPI() {
  try {
    const response = await fetch('/api/endpoint');

    if (!response.ok) {
      throw new ApiError(`API request failed`, {
        apiStatusCode: response.status,
        endpoint: '/api/endpoint',
        method: 'GET'
      });
    }

    return await response.json();
  } catch (error) {
    const appError = normalizeError(error, 'API call failed', {
      category: 'api'
    });

    handleError(appError, { endpoint: '/api/endpoint' });
    throw appError;
  }
}
```

### With Safe Wrappers

```typescript
// Create a safe version of a function
const safeGetUserData = withErrorHandling(getUserData);

// Use it without try/catch
const result = await safeGetUserData(userId);
if (result.success) {
  displayUserData(result.data);
} else {
  showErrorToast(result.error.userMessage);
}
```

## Integration Points

### Logger Service

All error handlers automatically integrate with the logging service via `loggerService.withContext('ErrorHandler')`.

### SvelteKit

Integrates with SvelteKit's error handling through `createErrorResponse()` which returns `App.Error` compatible objects.

### Event System

Errors can be published to the event system for centralized error tracking:

```typescript
import { publish } from '$lib/services/events';

try {
  // operation
} catch (error) {
  const appError = normalizeError(error);
  publish('error:occurred', {
    error: appError,
    timestamp: Date.now()
  });
}
```

## Best Practices

1. **Always normalize errors** at catch boundaries
2. **Use appropriate error classes** for different error types
3. **Provide user-friendly messages** via `userMessage` property
4. **Add context** to help with debugging
5. **Mark sensitive errors** with `containsSensitiveInfo: true`
6. **Use safe wrappers** (`tryCatch`, `withErrorHandling`) for optional operations
7. **Log errors consistently** using `handleError()`

## Type Definitions

```typescript
interface ErrorOptions {
  category?: string;
  statusCode?: number;
  context?: Record<string, any>;
  userVisible?: boolean;
  userMessage?: string;
  code?: string;
  containsSensitiveInfo?: boolean;
  cause?: Error;
}

interface FormattedError {
  message: string;
  name: string;
  category: string;
  statusCode?: number;
  userMessage?: string;
  stack?: string;
  context?: Record<string, any>;
  details?: Record<string, any>;
}
```
