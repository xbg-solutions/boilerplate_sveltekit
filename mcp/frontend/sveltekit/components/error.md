# Error Components

Components for displaying and handling errors with user-friendly interfaces.

## Components

### ErrorDisplay

Generic error display component with retry and dismiss functionality.

**Location**: `$lib/components/error/ErrorDisplay.svelte`

**Props:**
- `error`: Error | string - Error object or message
- `title`: string - Error title (default: 'An error occurred')
- `message`: string - Custom error message (overrides error.message)
- `showStack`: boolean - Show error stack trace (dev mode only)
- `showRetry`: boolean - Show retry button (default: true)
- `showDismiss`: boolean - Show dismiss button (default: true)
- `variant`: 'danger' | 'warning' | 'info' - Visual style
- `icon`: boolean - Show error icon

**Events:**
- `on:retry` - Retry button clicked
- `on:dismiss` - Dismiss button clicked
- `on:reportError` - Report error button clicked

**Usage:**
```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';

  let error = null;

  async function fetchData() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      // Process data
    } catch (e) {
      error = e;
    }
  }

  function handleRetry() {
    error = null;
    fetchData();
  }
</script>

{#if error}
  <ErrorDisplay
    {error}
    title="Failed to Load Data"
    variant="danger"
    showRetry={true}
    on:retry={handleRetry}
    on:dismiss={() => error = null}
  />
{/if}
```

**Display Variants:**

1. **Danger** (default):
   ```svelte
   <ErrorDisplay
     error={criticalError}
     variant="danger"
   />
   ```
   - Red color scheme
   - Prominent display
   - For critical errors

2. **Warning**:
   ```svelte
   <ErrorDisplay
     error={warningError}
     variant="warning"
   />
   ```
   - Yellow/orange color scheme
   - For non-critical issues

3. **Info**:
   ```svelte
   <ErrorDisplay
     error={infoMessage}
     variant="info"
   />
   ```
   - Blue color scheme
   - For informational messages

**Features:**

- **Error Parsing**: Handles Error objects, strings, and objects with message property
- **Stack Trace**: Shows stack trace in development mode (when `showStack` is true)
- **User-Friendly Messages**: Translates technical errors to user-friendly text
- **Action Buttons**: Retry and dismiss actions
- **Responsive Design**: Works on all screen sizes
- **Accessible**: ARIA roles and announcements

### ErrorBoundary

Error boundary component for catching and displaying component errors.

**Location**: `$lib/components/error/ErrorBoundary.svelte`

**Props:**
- `fallback`: Component - Custom fallback component
- `onError`: (error, info) => void - Error callback
- `showErrorDetails`: boolean - Show error details (dev mode)
- `resetOnNavigate`: boolean - Reset error on route change

**Usage:**
```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error';
  import { reportError } from '$lib/services/errorReporting';

  function handleError(error, errorInfo) {
    console.error('Component error:', error);
    reportError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
</script>

<ErrorBoundary
  onError={handleError}
  showErrorDetails={import.meta.env.DEV}
>
  <ProblematicComponent />
</ErrorBoundary>
```

**Custom Fallback:**
```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error';
  import CustomErrorFallback from './CustomErrorFallback.svelte';
</script>

<ErrorBoundary fallback={CustomErrorFallback}>
  <RiskyComponent />
</ErrorBoundary>
```

**Features:**

- **Error Catching**: Catches errors in child component tree
- **Error Recovery**: Reset button to recover from errors
- **Navigation Reset**: Automatically reset on route changes
- **Error Reporting**: Integration with error reporting services
- **Development Info**: Shows detailed error info in dev mode
- **Graceful Degradation**: Prevents entire app crash

## Error Display Patterns

### API Error Handling

```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';

  let error = null;
  let loading = false;

  async function loadData() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <LoadingSpinner />
{:else if error}
  <ErrorDisplay
    {error}
    title="Failed to Load Users"
    message="We couldn't load the user list. Please try again."
    on:retry={loadData}
  />
{:else}
  <UserList />
{/if}
```

### Form Validation Errors

```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';

  let formErrors = [];

  function validateForm(data) {
    formErrors = [];

    if (!data.email) {
      formErrors.push('Email is required');
    }
    if (!data.password || data.password.length < 8) {
      formErrors.push('Password must be at least 8 characters');
    }

    return formErrors.length === 0;
  }
</script>

{#if formErrors.length > 0}
  <ErrorDisplay
    error={formErrors.join('. ')}
    variant="warning"
    showRetry={false}
    on:dismiss={() => formErrors = []}
  />
{/if}

<form on:submit|preventDefault={handleSubmit}>
  <!-- Form fields -->
</form>
```

### Authentication Errors

```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';
  import { signIn } from '$lib/services/auth';

  let authError = null;

  async function handleSignIn(email, password) {
    try {
      await signIn(email, password);
    } catch (error) {
      // Translate auth errors to user-friendly messages
      switch (error.code) {
        case 'auth/user-not-found':
          authError = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          authError = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          authError = 'Too many failed attempts. Please try again later.';
          break;
        default:
          authError = 'Failed to sign in. Please try again.';
      }
    }
  }
</script>

{#if authError}
  <ErrorDisplay
    error={authError}
    variant="danger"
    showRetry={false}
    on:dismiss={() => authError = null}
  />
{/if}
```

### Page-Level Error Boundary

```svelte
<!-- +layout.svelte -->
<script>
  import { ErrorBoundary } from '$lib/components/error';
  import { page } from '$app/stores';
  import * as Sentry from '@sentry/svelte';

  function handleError(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: {
        svelte: {
          componentStack: errorInfo.componentStack
        }
      },
      tags: {
        page: $page.url.pathname
      }
    });
  }
</script>

<ErrorBoundary
  onError={handleError}
  resetOnNavigate={true}
>
  <slot />
</ErrorBoundary>
```

### Inline Error Messages

```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';

  let fieldErrors = {
    email: '',
    password: ''
  };
</script>

<div class="form-field">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    class:error={fieldErrors.email}
  />
  {#if fieldErrors.email}
    <ErrorDisplay
      error={fieldErrors.email}
      variant="warning"
      showRetry={false}
      showDismiss={false}
      class="text-sm mt-1"
    />
  {/if}
</div>
```

## Error Message Transformation

Transform technical errors to user-friendly messages:

```typescript
// lib/utils/errorMessages.ts
export function getUserFriendlyError(error: Error): string {
  const errorMap = {
    'ECONNREFUSED': 'Unable to connect to the server. Please check your internet connection.',
    'ETIMEDOUT': 'The request timed out. Please try again.',
    'NetworkError': 'Network error. Please check your connection.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    // Add more mappings
  };

  const errorCode = error.code || error.name;
  return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
}
```

Usage:
```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';
  import { getUserFriendlyError } from '$lib/utils/errorMessages';

  let error = null;

  async function doSomething() {
    try {
      // Operation
    } catch (e) {
      error = getUserFriendlyError(e);
    }
  }
</script>

{#if error}
  <ErrorDisplay error={error} />
{/if}
```

## Integration with Error Reporting

```svelte
<script>
  import { ErrorDisplay } from '$lib/components/error';
  import * as Sentry from '@sentry/svelte';

  let error = null;

  function handleReportError() {
    if (error) {
      Sentry.captureException(error);
      // Show confirmation
      alert('Error reported. Thank you!');
    }
  }
</script>

<ErrorDisplay
  {error}
  on:reportError={handleReportError}
/>
```

## Styling

Customize error display with Tailwind classes:

```svelte
<ErrorDisplay
  {error}
  class="rounded-lg shadow-lg p-6 max-w-md mx-auto"
/>
```

Error variants use semantic colors:
- **Danger**: `bg-red-50 border-red-200 text-red-800`
- **Warning**: `bg-yellow-50 border-yellow-200 text-yellow-800`
- **Info**: `bg-blue-50 border-blue-200 text-blue-800`

## Accessibility

- **ARIA roles**: `role="alert"` for errors
- **Live regions**: `aria-live="polite"` for announcements
- **Focus management**: Focus on error display when shown
- **Keyboard navigation**: Accessible action buttons
- **Clear messaging**: Avoid technical jargon

## Best Practices

1. **Always provide user-friendly messages** - Translate technical errors
2. **Include retry actions** for transient failures
3. **Log errors** for debugging while showing simple messages
4. **Use ErrorBoundary** at strategic points in component tree
5. **Test error states** thoroughly
6. **Provide context** in error messages (what failed)
7. **Avoid exposing sensitive info** in error messages
8. **Implement error reporting** for production tracking
9. **Reset errors appropriately** (on retry, navigation, dismiss)
10. **Use appropriate variants** (danger for critical, warning for minor)

## Component Count: 2

- ErrorDisplay
- ErrorBoundary
