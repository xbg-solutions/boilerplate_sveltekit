# Error Handling Guide

This boilerplate includes a comprehensive error handling system with error boundaries, centralized error reporting, and user-friendly error recovery options.

## Overview

The error handling system consists of:

- **ErrorBoundary Component**: Catches and handles errors at different levels
- **Error Reporting Service**: Centralized error collection and monitoring
- **Enhanced Error Pages**: User-friendly error experiences
- **Error Testing Utilities**: Tools for testing error scenarios

## Error Boundary Component

The `ErrorBoundary` component provides three levels of error handling:

### Component Level
```svelte
<ErrorBoundary level="component" fallback="This component failed to load">
  <MyComponent />
</ErrorBoundary>
```

- Displays inline error UI within the component
- Shows retry and dismiss options
- Minimal visual disruption

### Page Level
```svelte
<ErrorBoundary level="page" fallback="This page failed to load">
  <slot />
</ErrorBoundary>
```

- Displays centered error card
- Shows navigation options (back, home)
- Technical details available

### Global Level
```svelte
<ErrorBoundary 
  level="global" 
  fallback="Application error occurred"
  contactEmail="support@example.com"
  enableReporting={true}
>
  <slot />
</ErrorBoundary>
```

- Full-screen error page
- Complete error reporting
- Contact information
- Comprehensive recovery options

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `'page' \| 'component' \| 'global'` | `'component'` | Error boundary level |
| `fallback` | `string` | `'Something went wrong'` | User-friendly error message |
| `showReload` | `boolean` | `true` | Show page reload button |
| `showHome` | `boolean` | `true` | Show home navigation button |
| `showBack` | `boolean` | `true` | Show back navigation button |
| `showRetry` | `boolean` | `true` | Show retry button |
| `showDetails` | `boolean` | `true` | Show technical details toggle |
| `enableReporting` | `boolean` | `false` | Enable error reporting |
| `contactEmail` | `string` | `''` | Support contact email |

## Events

```svelte
<ErrorBoundary
  on:error={(e) => console.log('Error caught:', e.detail.error)}
  on:retry={() => console.log('Retry attempted')}
  on:recover={() => console.log('Manual recovery')}
>
  <MyComponent />
</ErrorBoundary>
```

- `error`: Dispatched when an error is caught
- `retry`: Dispatched when retry is attempted
- `recover`: Dispatched on manual recovery

## Error Reporting Service

The error reporting service provides centralized error collection and monitoring.

### Configuration

```typescript
import { errorReportingService } from '$lib/services/error-reporting';

// Configure the service
errorReportingService.configure({
  endpoint: 'https://api.example.com/errors',
  enabled: true,
  user: currentUser,
  tags: { version: '1.0.0', environment: 'production' }
});
```

### Environment Variables

Add these to your `.env` file:

```env
VITE_ERROR_REPORTING_ENABLED=true
VITE_ERROR_REPORTING_ENDPOINT=https://your-error-service.com/api/errors
VITE_APP_VERSION=1.0.0
```

### Manual Error Reporting

```typescript
import { errorReportingService } from '$lib/services/error-reporting';

try {
  // Some operation
} catch (error) {
  await errorReportingService.reportError(error, {
    level: 'component',
    severity: 'high',
    tags: { operation: 'data-fetch' }
  });
}
```

### Breadcrumbs

The service automatically collects breadcrumbs for:

- Navigation changes
- Console messages
- DOM events (clicks, form submissions)
- API calls

You can add custom breadcrumbs:

```typescript
errorReportingService.addBreadcrumb({
  message: 'User clicked export button',
  category: 'user',
  level: 'info',
  data: { exportType: 'pdf' }
});
```

## Enhanced Error Pages

The global `+error.svelte` page provides comprehensive error handling:

### Features

- **Categorized Errors**: Different UI and suggestions based on HTTP status codes
- **Contextual Actions**: Relevant buttons based on error type
- **Technical Details**: Copy-to-clipboard error information
- **Recovery Suggestions**: Specific guidance for different error types
- **Retry Logic**: Smart retry with limits

### Error Categories

| Status Code | Category | Actions | Suggestions |
|-------------|----------|---------|-------------|
| 400 | Bad Request | Retry, Home, Back | Check URL, refresh page |
| 401 | Auth Required | Sign In, Home | Sign in, check session |
| 403 | Forbidden | Home, Back, Contact | Check permissions, contact admin |
| 404 | Not Found | Home, Back | Check URL, use search |
| 500 | Server Error | Retry, Home, Back | Try again, contact support |

## Testing Error Boundaries

### ErrorBoundaryTest Component

Use the test component to verify error boundary behavior:

```svelte
<script>
  import { ErrorBoundary, ErrorBoundaryTest } from '$lib/components/error-boundary';
</script>

<ErrorBoundary level="component">
  <ErrorBoundaryTest level="component" />
</ErrorBoundary>
```

### Error Testing Utilities

```typescript
import { ErrorTester } from '$lib/utils/error-testing';

// Trigger different error types
ErrorTester.triggerSyncError({ message: 'Test sync error' });
ErrorTester.triggerAsyncError({ delay: 1000 });
ErrorTester.triggerNetworkError({ statusCode: 500 });
ErrorTester.triggerAuthError();
```

### Vitest Integration

```typescript
import { ErrorBoundaryTestHelpers } from '$lib/utils/error-testing';

describe('Error Handling', () => {
  it('should catch errors', async () => {
    const consoleMock = ErrorBoundaryTestHelpers.mockConsole();
    
    const error = await ErrorBoundaryTestHelpers.waitForError(() => {
      ErrorTester.triggerSyncError();
    });
    
    expect(error).toBeInstanceOf(Error);
    consoleMock.restore();
  });
});
```

## Best Practices

### 1. Layer Your Error Boundaries

```svelte
<!-- App.svelte -->
<ErrorBoundary level="global" enableReporting={true}>
  
  <!-- +layout.svelte -->
  <ErrorBoundary level="page">
    
    <!-- Component.svelte -->
    <ErrorBoundary level="component">
      <RiskyComponent />
    </ErrorBoundary>
    
  </ErrorBoundary>
</ErrorBoundary>
```

### 2. Configure Based on Environment

```typescript
// In your app initialization
errorReportingService.configure({
  enabled: import.meta.env.PROD,
  endpoint: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT,
  tags: {
    environment: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION
  }
});
```

### 3. Handle Async Errors

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  
  let promise = fetchData();
  
  async function fetchData() {
    try {
      return await api.getData();
    } catch (error) {
      // This will be caught by the error boundary
      throw error;
    }
  }
</script>

<ErrorBoundary level="component">
  {#await promise}
    Loading...
  {:then data}
    {data}
  {:catch error}
    <!-- This won't be reached due to ErrorBoundary -->
  {/await}
</ErrorBoundary>
```

### 4. Add Context to Errors

```typescript
try {
  await processPayment(amount);
} catch (error) {
  error.context = { amount, userId, paymentMethod };
  throw error; // Will be caught by error boundary
}
```

### 5. Monitor Error Patterns

```typescript
// Check for error patterns in development
if (import.meta.env.DEV) {
  const reports = errorReportingService.getLocalReports();
  console.log('Recent errors:', reports);
}
```

## Integration with External Services

### Sentry Integration

```typescript
import * as Sentry from '@sentry/browser';

errorReportingService.configure({
  enabled: true,
  endpoint: '/api/errors', // Your proxy endpoint
  tags: { release: Sentry.getCurrentHub().getClient()?.getOptions().release }
});
```

### Custom API Integration

```typescript
// Create a custom endpoint to forward errors
// routes/api/errors/+server.ts
export async function POST({ request }) {
  const errorReport = await request.json();
  
  // Forward to your monitoring service
  await fetch('https://your-monitoring-service.com/errors', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.MONITORING_TOKEN}` },
    body: JSON.stringify(errorReport)
  });
  
  return new Response('OK');
}
```

## Troubleshooting

### Common Issues

1. **Errors not being caught**: Ensure ErrorBoundary wraps the component throwing errors
2. **Reporting not working**: Check network requests and endpoint configuration
3. **Test errors in production**: Use ErrorBoundaryTest component only in development
4. **Memory leaks**: Error boundaries automatically clean up event listeners

### Debug Mode

Enable debug logging:

```typescript
// Enable debug logging in development
if (import.meta.env.DEV) {
  errorReportingService.configure({
    enabled: true,
    tags: { debug: 'true' }
  });
}
```