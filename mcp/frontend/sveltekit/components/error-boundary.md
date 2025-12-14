# Error Boundary Components

Components for catching and handling component-level errors with recovery mechanisms.

## Components

### ErrorBoundary

Main error boundary component that catches errors in child component trees.

**Location**: `$lib/components/error-boundary/ErrorBoundary.svelte`

**Props:**
- `fallback`: Component | null - Custom fallback component to render on error
- `fallbackProps`: object - Props to pass to fallback component
- `onError`: (error: Error, errorInfo: ErrorInfo) => void - Error callback
- `onReset`: () => void - Reset callback
- `resetOnNavigate`: boolean - Auto-reset on route change (default: true)
- `resetKeys`: any[] - Reset when any key changes
- `showDetails`: boolean - Show error details (default: dev mode only)
- `reportError`: boolean - Auto-report errors (default: true)

**Error Info:**
```typescript
interface ErrorInfo {
  componentStack: string;
  timestamp: number;
  userAgent: string;
  location: string;
}
```

**Usage:**
```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';

  function handleError(error, errorInfo) {
    console.error('Caught error:', error);
    console.log('Component stack:', errorInfo.componentStack);
  }

  function handleReset() {
    console.log('Error boundary reset');
  }
</script>

<ErrorBoundary
  onError={handleError}
  onReset={handleReset}
  resetOnNavigate={true}
>
  <YourComponent />
</ErrorBoundary>
```

**Default Fallback UI:**

When an error occurs without custom fallback, shows:
- Error icon
- Error title
- Error message (user-friendly)
- "Try Again" button
- "Go to Home" button
- Error details (in dev mode)
- Error reporting button

**Features:**

1. **Automatic Error Catching**: Catches all errors in child components
2. **Error Recovery**: Reset button to attempt recovery
3. **Navigation Reset**: Automatically reset on route changes
4. **Reactive Reset**: Reset when specified dependencies change
5. **Error Reporting**: Optional automatic error reporting
6. **Development Info**: Detailed error info in dev mode
7. **Custom Fallbacks**: Use custom error UI
8. **Error Context**: Provides error context to children

### ErrorBoundaryTest

Test component for validating error boundary functionality.

**Location**: `$lib/components/error-boundary/ErrorBoundaryTest.svelte`

**Purpose:** Development tool for testing error boundary behavior.

**Features:**
- Trigger various error types
- Test error recovery
- Test navigation reset
- Test custom fallbacks
- Validate error reporting

**Usage:**
```svelte
<script>
  import { ErrorBoundary, ErrorBoundaryTest } from '$lib/components/error-boundary';
</script>

{#if import.meta.env.DEV}
  <ErrorBoundary>
    <ErrorBoundaryTest />
  </ErrorBoundary>
{/if}
```

## Error Boundary Patterns

### Page-Level Error Boundary

Wrap entire pages to catch all errors:

```svelte
<!-- +layout.svelte -->
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import { page } from '$app/stores';
  import { reportError } from '$lib/services/errorReporting';

  function handleError(error, errorInfo) {
    reportError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: $page.url.pathname,
      timestamp: errorInfo.timestamp
    });
  }
</script>

<ErrorBoundary
  onError={handleError}
  resetOnNavigate={true}
  showDetails={import.meta.env.DEV}
>
  <slot />
</ErrorBoundary>
```

### Component-Level Error Boundary

Wrap specific risky components:

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';

  let dataKey = 0; // Change to reset error boundary

  function handleError(error) {
    console.error('Chart error:', error);
    // Maybe show notification
  }
</script>

<ErrorBoundary
  onError={handleError}
  resetKeys={[dataKey]}
>
  <ComplexChart data={chartData} />
</ErrorBoundary>

<button on:click={() => dataKey++}>
  Reload Chart
</button>
```

### Custom Fallback Component

Create custom error UI:

```svelte
<!-- CustomErrorFallback.svelte -->
<script>
  export let error;
  export let reset;
  export let errorInfo;
</script>

<div class="custom-error-container">
  <h2>Oops! Something went wrong</h2>

  <p class="error-message">
    {error.message || 'An unexpected error occurred'}
  </p>

  <div class="error-actions">
    <button on:click={reset} class="btn-primary">
      Try Again
    </button>
    <a href="/" class="btn-secondary">
      Go Home
    </a>
    <a href="/support" class="btn-link">
      Contact Support
    </a>
  </div>

  {#if import.meta.env.DEV}
    <details class="error-details">
      <summary>Error Details</summary>
      <pre>{error.stack}</pre>
      <pre>{errorInfo.componentStack}</pre>
    </details>
  {/if}
</div>

<style>
  .custom-error-container {
    padding: 2rem;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .error-message {
    color: #dc2626;
    margin: 1rem 0;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .error-details {
    margin-top: 2rem;
    text-align: left;
  }

  .error-details pre {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-size: 0.875rem;
  }
</style>
```

Use custom fallback:
```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import CustomErrorFallback from './CustomErrorFallback.svelte';
</script>

<ErrorBoundary fallback={CustomErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

### Multiple Error Boundaries

Use multiple boundaries for different error handling strategies:

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
</script>

<div class="app">
  <!-- Critical UI - show error but keep app running -->
  <ErrorBoundary onError={logError}>
    <Header />
  </ErrorBoundary>

  <!-- Main content - full error page -->
  <ErrorBoundary onError={reportCriticalError}>
    <main>
      <!-- Nested boundary for sidebar -->
      <ErrorBoundary onError={logError} fallback={SidebarError}>
        <Sidebar />
      </ErrorBoundary>

      <!-- Nested boundary for content -->
      <ErrorBoundary onError={logError}>
        <slot />
      </ErrorBoundary>
    </main>
  </ErrorBoundary>

  <!-- Footer - ignore errors -->
  <ErrorBoundary onError={logError}>
    <Footer />
  </ErrorBoundary>
</div>
```

### Error Boundary with Loading States

Combine with async data loading:

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import { onMount } from 'svelte';

  let loading = true;
  let data = null;
  let dataVersion = 0; // For resetting error boundary

  async function loadData() {
    loading = true;
    try {
      const response = await fetch('/api/data');
      data = await response.json();
    } finally {
      loading = false;
    }
  }

  function handleRetry() {
    dataVersion++; // Reset error boundary
    loadData();
  }

  onMount(loadData);
</script>

{#if loading}
  <LoadingSpinner />
{:else}
  <ErrorBoundary
    resetKeys={[dataVersion]}
    onReset={handleRetry}
  >
    <DataDisplay {data} />
  </ErrorBoundary>
{/if}
```

### Error Reporting Integration

Integrate with error tracking services:

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import * as Sentry from '@sentry/svelte';
  import { browser } from '$app/environment';

  function handleError(error, errorInfo) {
    if (browser) {
      Sentry.captureException(error, {
        contexts: {
          svelte: {
            componentStack: errorInfo.componentStack,
            timestamp: errorInfo.timestamp
          }
        },
        tags: {
          errorBoundary: true
        },
        level: 'error'
      });
    }
  }
</script>

<ErrorBoundary
  onError={handleError}
  reportError={true}
>
  <slot />
</ErrorBoundary>
```

### Conditional Error Boundaries

Enable/disable based on environment:

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import { dev } from '$app/environment';
</script>

{#if dev}
  <!-- In dev, let errors bubble up for debugging -->
  <slot />
{:else}
  <!-- In production, catch and display errors gracefully -->
  <ErrorBoundary
    onError={handleError}
    reportError={true}
  >
    <slot />
  </ErrorBoundary>
{/if}
```

## Reset Strategies

### Manual Reset

```svelte
<script>
  let errorBoundaryKey = 0;

  function resetErrorBoundary() {
    errorBoundaryKey++;
  }
</script>

{#key errorBoundaryKey}
  <ErrorBoundary>
    <Component />
  </ErrorBoundary>
{/key}

<button on:click={resetErrorBoundary}>
  Reset
</button>
```

### Automatic Reset on Data Change

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';

  export let userId;
</script>

<ErrorBoundary resetKeys={[userId]}>
  <UserProfile {userId} />
</ErrorBoundary>
```

### Navigation-Based Reset

```svelte
<script>
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import { page } from '$app/stores';
</script>

<ErrorBoundary
  resetKeys={[$page.url.pathname]}
  resetOnNavigate={true}
>
  <slot />
</ErrorBoundary>
```

## Error Context

Access error boundary context in child components:

```svelte
<!-- In child component -->
<script>
  import { getContext } from 'svelte';

  const errorBoundary = getContext('errorBoundary');

  function handleAction() {
    try {
      // Risky operation
    } catch (error) {
      // Manually trigger error boundary
      errorBoundary.handleError(error);
    }
  }
</script>
```

## Best Practices

1. **Strategic Placement**: Place boundaries at appropriate levels
   - Root level for app-wide protection
   - Page level for route isolation
   - Component level for risky operations

2. **Custom Fallbacks**: Provide user-friendly error messages

3. **Error Reporting**: Always integrate with error tracking

4. **Development vs Production**:
   - Show details in dev
   - Hide details in production
   - Always log errors

5. **Reset Mechanisms**: Provide clear recovery paths

6. **Testing**: Use ErrorBoundaryTest in development

7. **Granularity**: Multiple small boundaries better than one large

8. **Error Context**: Provide useful context in error callbacks

9. **User Experience**:
   - Clear error messages
   - Actionable recovery options
   - Maintain app state when possible

10. **Monitoring**: Track error boundary triggers in analytics

## Accessibility

- **Focus management**: Focus on error message when shown
- **ARIA roles**: `role="alert"` for error messages
- **Keyboard navigation**: Accessible action buttons
- **Screen readers**: Announce errors with `aria-live`
- **Clear messaging**: Avoid technical jargon

## Performance

- Minimal overhead when no errors
- Efficient error catching
- No impact on normal rendering
- Cleanup on unmount

## Testing

Test error boundaries:

```typescript
// ErrorBoundary.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import ErrorBoundary from '$lib/components/error-boundary/ErrorBoundary.svelte';
import ThrowError from './ThrowError.test.svelte';

describe('ErrorBoundary', () => {
  it('catches errors', () => {
    const { getByText } = render(ErrorBoundary, {
      props: { children: ThrowError }
    });

    expect(getByText('An error occurred')).toBeInTheDocument();
  });

  it('resets on button click', async () => {
    const { getByText } = render(ErrorBoundary, {
      props: { children: ThrowError }
    });

    await fireEvent.click(getByText('Try Again'));
    // Verify reset behavior
  });
});
```

## Component Count: 2

- ErrorBoundary (main error boundary)
- ErrorBoundaryTest (development testing tool)
