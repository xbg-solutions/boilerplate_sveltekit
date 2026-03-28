/**
 * src/lib/components/error/ErrorBoundary.svelte
 * Error Boundary Component
 *
 * A component that catches errors in its child components and
 * displays a fallback UI when an error occurs. Integrates with
 * the application's error handling and event systems.
 */
<script lang="ts">
  import type { Snippet } from 'svelte';
  import ErrorDisplay from './ErrorDisplay.svelte';
  import { normalizeError, handleError } from '$lib/utils/error-handler';
  import { loggerService } from '$lib/services/logging/logging.service';
  import { publish } from '$lib/services/events';

  // Create a logger for the error boundary
  const logger = loggerService.withContext('ErrorBoundary');

  // Define event names for error handling
  export const ERROR_EVENTS = {
    ERROR_CAUGHT: 'error:caught',
    ERROR_RECOVERY: 'error:recovery-attempted',
  };

  // Props
  let {
    fallback = undefined,
    onError = undefined,
    showReset = true,
    componentName = '',
    recoveryOptions = [],
    onerror: onErrorEvent = undefined,
    onrecovery = undefined,
    children
  }: {
    fallback?: string;
    onError?: (error: any) => void;
    showReset?: boolean;
    componentName?: string;
    recoveryOptions?: Array<{label: string, action: string}>;
    onerror?: (detail: { error: any; metadata: Record<string, any> }) => void;
    onrecovery?: (detail: { action: string; error: any }) => void;
    children?: Snippet;
  } = $props();

  // State
  let error: any = $state(null);
  let hasError = $state(false);
  let originalWindow: any = $state(undefined);
  let errorTimestamp: number = $state(0);
  let errorMetadata: Record<string, any> = $state({});

  // Handle component lifecycle
  $effect(() => {
    if (typeof window !== 'undefined') {
      originalWindow = {
        onerror: window.onerror
      };

      // Set up global error handler
      window.onerror = (message, source, lineno, colno, originalError) => {
        captureError(originalError || message, {
          source,
          lineno,
          colno
        });

        // Call original handler if it exists
        if (originalWindow.onerror) {
          return originalWindow.onerror(message, source, lineno, colno, originalError);
        }

        return false;
      };
    }

    // Cleanup: restore original error handler
    return () => {
      if (typeof window !== 'undefined' && originalWindow) {
        window.onerror = originalWindow.onerror;
      }
    };
  });

  // Function to capture and process errors
  function captureError(err: any, metadata: Record<string, any> = {}) {
    // Normalize the error
    const normalizedError = normalizeError(err);

    // Capture metadata for debugging
    errorMetadata = {
      componentName,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Set error timestamp
    errorTimestamp = Date.now();

    // Log the error
    logger.error('Error caught by boundary', normalizedError, {
      componentName,
      ...metadata
    });

    // Call event callback prop
    onErrorEvent?.({
      error: normalizedError,
      metadata: errorMetadata
    });

    // Publish application-wide event
    publish(ERROR_EVENTS.ERROR_CAUGHT, {
      error: normalizedError,
      metadata: errorMetadata,
      boundary: componentName || 'unnamed'
    }, 'ErrorBoundary');

    // Call onError callback if provided
    if (onError) {
      try {
        onError(normalizedError);
      } catch (callbackError) {
        logger.error('Error in error handler callback',
          callbackError instanceof Error ? callbackError : new Error(String(callbackError)),
          { originalError: normalizedError }
        );
      }
    }

    // Set error state
    error = normalizedError;
    hasError = true;
  }

  // Function to reset the error state
  export function reset() {
    // Publish recovery attempt event
    if (hasError) {
      publish(ERROR_EVENTS.ERROR_RECOVERY, {
        error,
        metadata: errorMetadata,
        boundary: componentName || 'unnamed',
        recoveryMethod: 'reset'
      }, 'ErrorBoundary');

      // Log recovery attempt
      logger.info('Error boundary reset', {
        componentName,
        errorAge: Date.now() - errorTimestamp
      });
    }

    // Reset state
    error = null;
    hasError = false;
    errorMetadata = {};
  }

  // Function to handle recovery option selection
  function handleRecoveryOption(action: string) {
    // Publish recovery attempt event
    publish(ERROR_EVENTS.ERROR_RECOVERY, {
      error,
      metadata: errorMetadata,
      boundary: componentName || 'unnamed',
      recoveryMethod: action
    }, 'ErrorBoundary');

    // Log recovery attempt
    logger.info(`Recovery option selected: ${action}`, {
      componentName,
      errorAge: Date.now() - errorTimestamp
    });

    // Call recovery callback prop
    onrecovery?.({ action, error });

    // Reset error state
    reset();
  }
</script>

{#if hasError}
  {#if fallback}
    <div class="error-boundary-fallback">
      {fallback}
    </div>
  {:else}
    <ErrorDisplay
      status={error?.statusCode || 500}
      message={error?.message || 'An unexpected error occurred'}
      userMessage={error?.userMessage}
      details={error}
      recoveryOptions={recoveryOptions}
      onrecovery={(detail) => handleRecoveryOption(detail.action)}
    />

    {#if showReset}
      <button
        class="bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded hover:bg-blue-200 transition-colors mt-4"
        onclick={reset}
      >
        Retry
      </button>
    {/if}
  {/if}
{:else}
  {@render children?.()}
{/if}