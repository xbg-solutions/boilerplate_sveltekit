/**
 * src/lib/components/error/ErrorDisplay.svelte
 * Error Display Component
 *
 * A reusable component for displaying error messages with
 * appropriate styling and recovery actions.
 */
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Button, Alert, AlertDescription, Card } from '$lib/components/ui';
  import { dev } from '$app/environment';
  import { formatError } from '$lib/utils/error-handler';

  // Props
  let {
    status,
    message = '',
    userMessage = '',
    details = null,
    redirect = '',
    showBackButton = true,
    showHomeButton = true,
    containerClass = '',
    recoveryOptions = [],
    onrecovery = undefined,
    'additional-actions': additionalActions
  }: {
    status: number;
    message?: string;
    userMessage?: string;
    details?: any;
    redirect?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
    containerClass?: string;
    recoveryOptions?: Array<{label: string, action: string}>;
    onrecovery?: (detail: { action: string }) => void;
    'additional-actions'?: Snippet;
  } = $props();

  // Determine if this is an authorization error
  let isAuthError = $derived(status === 401 || status === 403);

  // Apply error formatting
  let formattedError = $derived(details ? formatError(details, dev) : null);

  // Generate a user-friendly message based on the status code
  let friendlyMessage = $derived(userMessage || getFriendlyMessage(status, message));

  function getFriendlyMessage(status: number, message: string): string {
    // If a message is provided, use it
    if (message) return message;

    // Otherwise provide a default based on status
    switch (status) {
      case 401:
        return 'Authentication required. Please sign in.';
      case 403:
        return 'You don\'t have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'An unexpected server error occurred.';
      default:
        return 'An error occurred.';
    }
  }

  // Map status codes to SHADCN alert styling
  function getAlertStyling(status: number): { class: string, textClass: string } {
    if (status === 401 || status === 403) return {
      class: 'border-red-200 bg-red-50',
      textClass: 'text-red-800'
    };
    if (status === 404) return {
      class: 'border-yellow-200 bg-yellow-50',
      textClass: 'text-yellow-800'
    };
    if (status >= 500) return {
      class: 'border-purple-200 bg-purple-50',
      textClass: 'text-purple-800'
    };
    return {
      class: 'border-blue-200 bg-blue-50',
      textClass: 'text-blue-800'
    };
  }

  // Handle recovery option selection
  function handleRecoveryOption(action: string) {
    onrecovery?.({ action });
  }

  // Determine alert styling based on status
  let alertStyling = $derived(getAlertStyling(status));

  // Determine action text for redirect button
  let actionText = $derived(isAuthError ? 'Sign In' : 'Continue');
</script>

<Card class="{containerClass || 'max-w-lg mx-auto mt-8'}">
  <h2 class="text-xl font-bold mb-4">Error {status}</h2>

  <Alert class="mb-4 {alertStyling.class}">
    <AlertDescription class="font-medium {alertStyling.textClass}">
      {friendlyMessage}
    </AlertDescription>
  </Alert>

  {#if dev && formattedError}
    <div class="p-3 bg-gray-50 rounded mb-4 text-sm text-gray-700 overflow-auto max-h-64">
      <h3 class="font-semibold mb-2">Technical Details:</h3>
      {#if formattedError.category}
        <p><span class="font-semibold">Category:</span> {formattedError.category}</p>
      {/if}
      {#if formattedError.name}
        <p><span class="font-semibold">Type:</span> {formattedError.name}</p>
      {/if}
      {#if formattedError.message}
        <p><span class="font-semibold">Message:</span> {formattedError.message}</p>
      {/if}
      {#if formattedError.details}
        <p class="font-semibold mt-1">Details:</p>
        <pre class="text-xs">{JSON.stringify(formattedError.details, null, 2)}</pre>
      {/if}
      {#if formattedError.stack}
        <p class="font-semibold mt-1">Stack:</p>
        <pre class="text-xs whitespace-pre-wrap">{formattedError.stack}</pre>
      {/if}
    </div>
  {/if}

  <div class="flex flex-wrap gap-3">
    {#if redirect}
      <Button href={redirect} color="blue">
        {actionText}
      </Button>
    {/if}

    {#each recoveryOptions as option}
      <Button
        color="green"
        onclick={() => handleRecoveryOption(option.action)}
      >
        {option.label}
      </Button>
    {/each}

    {@render additionalActions?.()}

    {#if showHomeButton}
      <Button href="/" color={redirect ? 'light' : 'blue'}>
        Home
      </Button>
    {/if}

    {#if showBackButton}
      <Button color="light" onclick={() => history.back()}>
        Back
      </Button>
    {/if}
  </div>
</Card>