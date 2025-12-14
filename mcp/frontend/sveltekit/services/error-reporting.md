# Error Reporting Service

## Overview

The Error Reporting Service provides centralized error collection and reporting for production monitoring. It captures errors with rich context including breadcrumbs, user information, and environment data. The service supports local storage for offline scenarios and can send reports to a remote endpoint.

## Location

- **Service**: `/src/lib/services/error-reporting/error-reporting.service.ts`
- **Export**: `/src/lib/services/error-reporting/index.ts`

## Key Features

- **Error Collection**: Centralized error capture with rich metadata
- **Breadcrumbs**: Automatic tracking of navigation, console, and DOM events
- **User Context**: Attaches user information to error reports
- **Severity Detection**: Automatic severity classification
- **Local Storage**: Offline error storage and retrieval
- **Remote Reporting**: HTTP endpoint integration
- **Environment Aware**: Includes environment and version information

## Configuration

Configure via environment variables:

```env
VITE_ERROR_REPORTING_ENABLED=true
VITE_ERROR_REPORTING_ENDPOINT=https://api.example.com/errors
VITE_APP_VERSION=1.0.0
```

## Key Methods

### configure(config)

Configure the error reporting service.

```typescript
errorReportingService.configure({
  endpoint: 'https://api.example.com/errors',
  enabled: true,
  user: currentUser,
  tags: {
    environment: 'production',
    region: 'us-west-2'
  }
});
```

**Parameters**:
- `endpoint` (optional) - Error reporting endpoint URL
- `enabled` (optional) - Enable/disable error reporting
- `user` (optional) - Firebase User object for context
- `tags` (optional) - Custom tags to attach to all errors

### reportError(error, context?)

Report an error to the service.

```typescript
try {
  await riskyOperation();
} catch (error) {
  await errorReportingService.reportError(error, {
    errorId: 'custom-error-123',
    level: 'component',
    severity: 'high',
    tags: { feature: 'checkout', step: 'payment' },
    url: window.location.href
  });
}
```

**Parameters**:
- `error` (required) - Error object to report
- `context` (optional):
  - `errorId` - Custom error identifier
  - `level` - Error level: 'page' | 'component' | 'global'
  - `severity` - Severity: 'low' | 'medium' | 'high' | 'critical'
  - `tags` - Additional tags for this error
  - `url` - Custom URL (defaults to current location)

**Returns**: Promise<boolean> indicating success

**Behavior**:
- Builds error report with full context
- Logs error locally
- Sends to remote endpoint if configured
- Stores in localStorage for offline scenarios
- Returns false if reporting is disabled

### addBreadcrumb(breadcrumb)

Add a breadcrumb for context tracking.

```typescript
errorReportingService.addBreadcrumb({
  message: 'User clicked checkout button',
  category: 'user',
  level: 'info',
  data: { cartTotal: 99.99, itemCount: 3 }
});
```

**Parameters**:
- `message` (required) - Breadcrumb description
- `category` (required) - 'navigation' | 'user' | 'api' | 'console' | 'dom'
- `level` (required) - 'info' | 'warning' | 'error'
- `data` (optional) - Additional context data

**Note**: Timestamp is added automatically

### getBreadcrumbs()

Get current breadcrumbs.

```typescript
const breadcrumbs = errorReportingService.getBreadcrumbs();
console.log('Recent activity:', breadcrumbs);
```

**Returns**: Array of ErrorBreadcrumb objects

### clearBreadcrumbs()

Clear all breadcrumbs.

```typescript
errorReportingService.clearBreadcrumbs();
```

### getLocalReports()

Get locally stored error reports.

```typescript
const reports = errorReportingService.getLocalReports();
console.log(`${reports.length} errors stored locally`);
```

**Returns**: Array of ErrorReport objects (max 10 most recent)

### clearLocalReports()

Clear locally stored error reports.

```typescript
errorReportingService.clearLocalReports();
```

## Error Report Structure

```typescript
{
  errorId: string,              // Unique error identifier
  message: string,              // Error message
  stack?: string,               // Stack trace
  timestamp: number,            // Error timestamp
  url: string,                  // Page URL where error occurred
  userAgent: string,            // Browser user agent
  userId?: string,              // User ID if available
  userEmail?: string,           // User email if available
  level: 'page' | 'component' | 'global',
  severity: 'low' | 'medium' | 'high' | 'critical',
  tags?: Record<string, string>,     // Custom tags
  breadcrumbs?: ErrorBreadcrumb[],   // Activity breadcrumbs
  environment: string,          // Environment (development/production)
  version: string               // App version
}
```

## Usage Examples

### Basic Error Reporting

```typescript
import { errorReportingService } from '$lib/services/error-reporting';

async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    // Report the error
    await errorReportingService.reportError(error, {
      level: 'component',
      severity: 'medium',
      tags: { userId, feature: 'user-profile' }
    });
    throw error;
  }
}
```

### Configure with User Context

```typescript
import { errorReportingService } from '$lib/services/error-reporting';
import { authService } from '$lib/services/auth';

// Configure when user logs in
authService.onAuthStateChanged((user) => {
  if (user) {
    errorReportingService.configure({
      user,
      tags: {
        userId: user.uid,
        plan: 'premium'
      }
    });
  }
});
```

### Custom Breadcrumbs

```typescript
// Add breadcrumbs for important user actions
function handleCheckout() {
  errorReportingService.addBreadcrumb({
    message: 'Checkout initiated',
    category: 'user',
    level: 'info',
    data: {
      cartTotal: cart.total,
      itemCount: cart.items.length
    }
  });

  // ... checkout logic
}

function handlePayment() {
  errorReportingService.addBreadcrumb({
    message: 'Payment submitted',
    category: 'user',
    level: 'info',
    data: { paymentMethod: 'credit_card' }
  });

  // ... payment logic
}
```

### Page-Level Error Boundary

```typescript
// In +error.svelte or error boundary component
import { errorReportingService } from '$lib/services/error-reporting';
import { page } from '$app/stores';

export let error: Error;

// Report page-level errors
errorReportingService.reportError(error, {
  level: 'page',
  severity: 'high',
  url: $page.url.href,
  tags: {
    route: $page.route.id
  }
});
```

### Component Error Handling

```typescript
<script lang="ts">
  import { errorReportingService } from '$lib/services/error-reporting';
  import { onMount } from 'svelte';

  let data = null;
  let error = null;

  onMount(async () => {
    try {
      data = await loadData();
    } catch (err) {
      error = err;

      // Report component-level error
      await errorReportingService.reportError(err, {
        level: 'component',
        severity: 'medium',
        tags: { component: 'DataLoader' }
      });
    }
  });
</script>
```

### Critical Error Reporting

```typescript
async function performCriticalOperation() {
  try {
    await saveUserData();
  } catch (error) {
    // Report as critical
    await errorReportingService.reportError(error, {
      level: 'global',
      severity: 'critical',
      tags: {
        operation: 'save-user-data',
        impact: 'data-loss-risk'
      }
    });

    // Show user error message
    showErrorNotification('Critical error occurred');
  }
}
```

### API Error Tracking

```typescript
async function apiRequest(endpoint: string, options: RequestInit) {
  // Add API breadcrumb
  errorReportingService.addBreadcrumb({
    message: `API Request: ${endpoint}`,
    category: 'api',
    level: 'info',
    data: { method: options.method }
  });

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const error = new Error(`API Error: ${response.status}`);

      await errorReportingService.reportError(error, {
        severity: response.status >= 500 ? 'high' : 'medium',
        tags: {
          endpoint,
          status: String(response.status),
          method: options.method
        }
      });

      throw error;
    }

    return response.json();
  } catch (error) {
    // Network or parsing error
    errorReportingService.addBreadcrumb({
      message: `API Request Failed: ${endpoint}`,
      category: 'api',
      level: 'error',
      data: { error: error.message }
    });

    throw error;
  }
}
```

### Review Stored Errors

```typescript
// Get locally stored errors for review
function reviewStoredErrors() {
  const reports = errorReportingService.getLocalReports();

  console.log(`Found ${reports.length} stored errors`);

  reports.forEach(report => {
    console.log(`[${report.severity}] ${report.message}`);
    console.log(`  Occurred at: ${new Date(report.timestamp).toISOString()}`);
    console.log(`  URL: ${report.url}`);
    console.log(`  Breadcrumbs: ${report.breadcrumbs?.length || 0}`);
  });
}
```

## Automatic Breadcrumbs

The service automatically tracks:

### Navigation Breadcrumbs
- Page transitions
- URL changes
- History API usage

### Console Breadcrumbs
- Console errors
- Console warnings
- Console info logs

### DOM Breadcrumbs
- Button clicks
- Link clicks
- Form submissions

## Severity Classification

Errors are automatically classified by severity:

- **Critical**: Contains 'critical' or 'fatal'
- **High**: Contains 'auth' or 'permission'
- **Medium**: Contains 'network' or 'fetch'
- **Low**: Contains 'chunk' or 'loading'

Override automatic classification by providing explicit `severity` in context.

## Integration Notes

- **SSR Safe**: Automatically skips when not in browser
- **Offline Support**: Stores errors locally when endpoint unavailable
- **Breadcrumb Limit**: Keeps last 50 breadcrumbs (configurable)
- **Report Limit**: Stores last 10 error reports in localStorage
- **Privacy**: Includes user email only if available from Firebase Auth
- **Environment Detection**: Automatically includes NODE_ENV and version
- **Singleton**: Single instance shared across the application
