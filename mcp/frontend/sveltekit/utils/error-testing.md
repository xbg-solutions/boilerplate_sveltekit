# Error Testing Utilities

## Overview

Helper functions for testing error boundaries, error handling, and error scenarios in development and testing environments.

**Location:** `src/lib/utils/error-testing.ts`

## ErrorTester Class

Generate and trigger test errors.

### generateError
```typescript
const error = ErrorTester.generateError({
  type: 'network',
  message: 'Custom error message',
  code: 'ERR_001',
  statusCode: 500
});
```

### triggerSyncError
```typescript
ErrorTester.triggerSyncError({
  message: 'Sync error occurred'
});
```

### triggerAsyncError
```typescript
await ErrorTester.triggerAsyncError({
  delay: 100,
  message: 'Async error occurred'
});
```

### triggerNetworkError
```typescript
ErrorTester.triggerNetworkError({
  statusCode: 404,
  message: 'Resource not found'
});
```

### triggerAuthError
```typescript
ErrorTester.triggerAuthError({
  message: 'Unauthorized'
});
```

### triggerValidationError
```typescript
ErrorTester.triggerValidationError({
  message: 'Invalid email'
});
```

### triggerTimeoutError
```typescript
ErrorTester.triggerTimeoutError({
  message: 'Request timeout'
});
```

### triggerUnhandledPromise
```typescript
ErrorTester.triggerUnhandledPromise({
  message: 'Unhandled rejection'
});
```

## Error Types

- `sync` - Synchronous error
- `async` - Asynchronous error
- `network` - Network/API error
- `chunk` - Code chunk loading error
- `auth` - Authentication error
- `validation` - Validation error
- `timeout` - Timeout error

## ErrorBoundaryTestHelpers

Helpers for testing error boundaries.

### waitForError
```typescript
const error = await ErrorBoundaryTestHelpers.waitForError(
  () => {
    throw new Error('Test error');
  },
  5000 // timeout
);
```

### mockConsole
```typescript
const { error, warn, log, restore } = ErrorBoundaryTestHelpers.mockConsole();

// Run tests...

// Check console calls
expect(error).toHaveBeenCalled();

// Restore
restore();
```

### createMockErrorReportingService
```typescript
const mockService = ErrorBoundaryTestHelpers.createMockErrorReportingService();

expect(mockService.reportError).toHaveBeenCalledWith(expect.objectContaining({
  message: 'Test error'
}));
```

## Common Patterns

### Test Error Boundary
```typescript
import { ErrorTester, ErrorBoundaryTestHelpers } from '$lib/utils/error-testing';

test('error boundary catches errors', async () => {
  const { error: consoleError, restore } = ErrorBoundaryTestHelpers.mockConsole();
  
  const error = await ErrorBoundaryTestHelpers.waitForError(() => {
    ErrorTester.triggerSyncError({ message: 'Test error' });
  });
  
  expect(error.message).toContain('Test error');
  expect(consoleError).toHaveBeenCalled();
  
  restore();
});
```

### Test Error Handler
```typescript
import { ErrorTester } from '$lib/utils/error-testing';

test('handles network errors', () => {
  const error = ErrorTester.generateError({
    type: 'network',
    statusCode: 500
  });
  
  const result = handleError(error);
  expect(result.statusCode).toBe(500);
});
```

### Test Component Error
```typescript
import { ErrorTester } from '$lib/utils/error-testing';
import { render } from '@testing-library/svelte';

test('component handles error', () => {
  const { container } = render(MyComponent);
  
  // Trigger error in component
  const button = container.querySelector('button');
  button.click();
  
  // Check error display
  expect(container).toHaveTextContent('Error occurred');
});
```

### Development Testing
```typescript
// Only expose in development
if (import.meta.env.DEV) {
  window.testError = {
    sync: () => ErrorTester.triggerSyncError(),
    async: () => ErrorTester.triggerAsyncError(),
    network: () => ErrorTester.triggerNetworkError()
  };
}
```

## Global Exposure

In development mode, ErrorTester is exposed globally:

```typescript
// In browser console (dev only)
ErrorTester.triggerSyncError();
ErrorTester.triggerNetworkError({ statusCode: 404 });
```

## Best Practices

1. Use in testing only
2. Mock console in tests
3. Clean up after tests
4. Test all error types
5. Verify error messages
6. Test error boundaries
7. Don't expose in production
