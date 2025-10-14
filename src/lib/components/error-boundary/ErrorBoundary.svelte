<!--
  Enhanced Error Boundary Component
  
  Provides comprehensive error handling with user-friendly messages,
  recovery options, and error reporting.
-->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Copy, Check } from 'lucide-svelte';
  import { toast } from '$lib/services/toast';
  import { loggerService } from '$lib/services/logging/logging.service';
  import { errorReportingService } from '$lib/services/error-reporting';
  
  // Props
  export let fallback: string = 'Something went wrong';
  export let showReload: boolean = true;
  export let showHome: boolean = true;
  export let showBack: boolean = true;
  export let showRetry: boolean = true;
  export let showDetails: boolean = true;
  export let enableReporting: boolean = false;
  export let contactEmail: string = '';
  export let level: 'page' | 'component' | 'global' = 'component';
  
  // Events
  const dispatch = createEventDispatcher<{
    error: { error: Error; componentStack?: string; timestamp: number };
    retry: void;
    recover: void;
  }>();
  
  // State
  let hasError = false;
  let error: Error | null = null;
  let errorId: string = '';
  let timestamp: number = 0;
  let retryCount = 0;
  let maxRetries = 3;
  let showErrorDetails = false;
  let copied = false;
  
  // Error recovery
  let errorHandlers: Array<() => void> = [];
  let unsubscribeFunctions: Array<() => void> = [];
  
  onMount(() => {
    if (!browser) return;
    
    // Global error handlers
    const handleError = (event: ErrorEvent) => {
      captureError(new Error(event.message), `${event.filename}:${event.lineno}:${event.colno}`);
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      captureError(error, 'Unhandled Promise Rejection');
    };
    
    // Console error capture
    const originalConsoleError = console.error;
    const handleConsoleError = (...args: any[]) => {
      const error = args.find(arg => arg instanceof Error);
      if (error) {
        captureError(error, 'Console Error');
      }
      originalConsoleError.apply(console, args);
    };
    
    // Svelte error handler
    const handleSvelteError = (event: any) => {
      if (event.error) {
        captureError(event.error, 'Svelte Runtime Error');
      }
    };
    
    // Only attach global handlers for global-level boundaries
    if (level === 'global') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('svelte:error', handleSvelteError);
      console.error = handleConsoleError;
      
      unsubscribeFunctions.push(() => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('svelte:error', handleSvelteError);
        console.error = originalConsoleError;
      });
    }
  });
  
  onDestroy(() => {
    unsubscribeFunctions.forEach(fn => fn());
  });
  
  function captureError(err: Error, context?: string) {
    if (hasError) return; // Prevent error loops
    
    error = err;
    hasError = true;
    timestamp = Date.now();
    errorId = generateErrorId();
    
    // Log the error
    loggerService.error('ErrorBoundary: Error captured', err, {
      context,
      errorId,
      timestamp,
      url: $page.url.pathname,
      userAgent: browser ? navigator.userAgent : 'SSR',
      level
    });
    
    // Dispatch error event
    dispatch('error', {
      error: err,
      componentStack: context,
      timestamp
    });
    
    // Report error if enabled
    if (enableReporting) {
      reportError(err, context);
    }
    
    // Add breadcrumb to error reporting service
    errorReportingService.addBreadcrumb({
      message: `Error caught by ${level} boundary: ${err.message}`,
      category: 'console',
      level: 'error',
      data: { context, errorId, level }
    });
  }
  
  async function reportError(error: Error, context?: string) {
    try {
      // Use the centralized error reporting service
      await errorReportingService.reportError(error, {
        errorId,
        level,
        severity: 'medium',
        tags: { context: context || 'error-boundary' },
        url: $page.url.pathname
      });
      
      loggerService.debug('Error report sent', { errorId });
    } catch (reportError) {
      loggerService.error('Failed to report error', reportError as Error, { errorId });
    }
  }
  
  function generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  function retry() {
    if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached');
      return;
    }
    
    retryCount++;
    hasError = false;
    error = null;
    
    loggerService.info('ErrorBoundary: Retry attempted', { errorId, retryCount });
    dispatch('retry');
    
    // Re-render slot
    setTimeout(() => {
      if (hasError) {
        toast.error('Error persists after retry');
      }
    }, 100);
  }
  
  function recover() {
    hasError = false;
    error = null;
    retryCount = 0;
    
    loggerService.info('ErrorBoundary: Manual recovery', { errorId });
    dispatch('recover');
  }
  
  function reload() {
    if (browser) {
      window.location.reload();
    }
  }
  
  function goHome() {
    if (browser) {
      window.location.href = '/';
    }
  }
  
  function goBack() {
    if (browser) {
      window.history.back();
    }
  }
  
  function toggleDetails() {
    showErrorDetails = !showErrorDetails;
  }
  
  async function copyErrorDetails() {
    if (!browser) return;
    
    const details = {
      errorId,
      message: error?.message,
      timestamp: new Date(timestamp).toISOString(),
      url: $page.url.pathname,
      stack: error?.stack
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      copied = true;
      toast.success('Error details copied to clipboard');
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      toast.error('Failed to copy error details');
    }
  }
  
  // Expose recovery function for parent components
  export function triggerRecovery() {
    recover();
  }
  
  // Expose error state for parent components
  export { hasError, error, errorId };
</script>

{#if hasError && error}
  <div class="error-boundary" data-level={level}>
    {#if level === 'global'}
      <!-- Full page error for global errors -->
      <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card class="max-w-2xl w-full">
          <CardHeader class="text-center">
            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle class="w-10 h-10 text-red-600" />
            </div>
            <CardTitle class="text-2xl text-red-600">Application Error</CardTitle>
            <p class="text-gray-600 mt-2">{fallback}</p>
            <Badge variant="outline" className="mt-2">Error ID: {errorId}</Badge>
          </CardHeader>
          
          <CardContent class="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle class="h-4 w-4" />
              <AlertDescription>
                <strong>{error.message}</strong>
                {#if timestamp}
                  <p class="text-sm mt-1 opacity-75">
                    Occurred at {new Date(timestamp).toLocaleString()}
                  </p>
                {/if}
              </AlertDescription>
            </Alert>
            
            {#if showDetails}
              <div class="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  on:click={toggleDetails}
                  class="w-full"
                >
                  <Bug class="w-4 h-4 mr-2" />
                  {showErrorDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
                
                {#if showErrorDetails}
                  <div class="bg-gray-100 p-4 rounded-lg text-sm">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-medium">Error Details</span>
                      <Button variant="ghost" size="sm" on:click={copyErrorDetails}>
                        {#if copied}
                          <Check class="w-4 h-4" />
                        {:else}
                          <Copy class="w-4 h-4" />
                        {/if}
                      </Button>
                    </div>
                    <pre class="whitespace-pre-wrap break-words text-xs">{error.stack || error.message}</pre>
                  </div>
                {/if}
              </div>
            {/if}
            
            {#if contactEmail}
              <div class="text-center">
                <p class="text-sm text-gray-600">
                  Need help? Contact us at 
                  <a href="mailto:{contactEmail}?subject=Error Report - {errorId}" class="text-blue-600 hover:underline">
                    {contactEmail}
                  </a>
                </p>
              </div>
            {/if}
          </CardContent>
          
          <CardFooter class="flex flex-col sm:flex-row gap-2">
            {#if showRetry && retryCount < maxRetries}
              <Button on:click={retry} class="flex-1">
                <RefreshCw class="w-4 h-4 mr-2" />
                Retry ({maxRetries - retryCount} left)
              </Button>
            {/if}
            
            {#if showReload}
              <Button variant="outline" on:click={reload} class="flex-1">
                <RefreshCw class="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            {/if}
            
            {#if showHome}
              <Button variant="outline" on:click={goHome} class="flex-1">
                <Home class="w-4 h-4 mr-2" />
                Go Home
              </Button>
            {/if}
          </CardFooter>
        </Card>
      </div>
      
    {:else if level === 'page'}
      <!-- Page-level error -->
      <div class="container mx-auto py-8 px-4">
        <Card class="max-w-2xl mx-auto">
          <CardHeader class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle class="w-8 h-8 text-red-600" />
            </div>
            <CardTitle class="text-xl text-red-600">Page Error</CardTitle>
            <p class="text-gray-600">{fallback}</p>
            <Badge variant="outline" className="mt-2">ID: {errorId}</Badge>
          </CardHeader>
          
          <CardContent class="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle class="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            
            {#if showDetails}
              <details class="text-sm">
                <summary class="cursor-pointer text-gray-600 hover:text-gray-800">
                  Technical Details
                </summary>
                <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto whitespace-pre-wrap">
{error.stack || error.message}
                </pre>
              </details>
            {/if}
          </CardContent>
          
          <CardFooter class="flex flex-wrap gap-2">
            {#if showRetry && retryCount < maxRetries}
              <Button size="sm" on:click={retry}>
                <RefreshCw class="w-4 h-4 mr-1" />
                Retry
              </Button>
            {/if}
            
            {#if showBack}
              <Button variant="outline" size="sm" on:click={goBack}>
                <ArrowLeft class="w-4 h-4 mr-1" />
                Go Back
              </Button>
            {/if}
            
            {#if showHome}
              <Button variant="outline" size="sm" on:click={goHome}>
                <Home class="w-4 h-4 mr-1" />
                Home
              </Button>
            {/if}
            
            {#if showReload}
              <Button variant="outline" size="sm" on:click={reload}>
                <RefreshCw class="w-4 h-4 mr-1" />
                Reload
              </Button>
            {/if}
          </CardFooter>
        </Card>
      </div>
      
    {:else}
      <!-- Component-level error -->
      <div class="error-boundary-component p-4 border border-red-200 bg-red-50 rounded-lg">
        <div class="flex items-start space-x-3">
          <AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-red-800">Component Error</h4>
              <Badge variant="outline" className="text-xs">ID: {errorId.slice(-6)}</Badge>
            </div>
            <p class="text-sm text-red-700 mt-1">{fallback}</p>
            <p class="text-xs text-red-600 mt-1">{error.message}</p>
            
            <div class="flex flex-wrap gap-2 mt-3">
              {#if showRetry && retryCount < maxRetries}
                <Button variant="outline" size="sm" on:click={retry}>
                  <RefreshCw class="w-3 h-3 mr-1" />
                  Retry
                </Button>
              {/if}
              
              <Button variant="ghost" size="sm" on:click={recover}>
                Dismiss
              </Button>
              
              {#if showDetails}
                <Button variant="ghost" size="sm" on:click={toggleDetails}>
                  <Bug class="w-3 h-3 mr-1" />
                  {showErrorDetails ? 'Hide' : 'Details'}
                </Button>
              {/if}
            </div>
            
            {#if showErrorDetails}
              <details class="mt-3">
                <summary class="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                <pre class="mt-1 p-2 bg-red-100 rounded text-xs overflow-auto whitespace-pre-wrap max-h-32">
{error.stack || error.message}
                </pre>
              </details>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    isolation: isolate;
  }
  
  .error-boundary-component {
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>