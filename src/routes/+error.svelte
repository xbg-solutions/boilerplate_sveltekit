<!--
  Global Error Page
  
  Handles all unhandled errors in the application with user-friendly messages
  and recovery options based on error type.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { 
    AlertTriangle, 
    Home, 
    ArrowLeft, 
    RefreshCw, 
    Lock, 
    Search,
    Wifi,
    Server,
    Bug,
    Copy,
    Check
  } from 'lucide-svelte';
  import { toast } from '$lib/services/toast';
  
  // Error data from SvelteKit
  $: error = $page.error;
  $: status = $page.status;
  $: errorMessage = error?.message || 'An unexpected error occurred';
  
  // Error type categorization
  $: errorType = getErrorType(status);
  $: errorConfig = getErrorConfig(errorType, status);
  
  // State
  let showDetails = false;
  let copied = false;
  let retryCount = 0;
  const maxRetries = 3;
  
  interface ErrorConfig {
    title: string;
    description: string;
    icon: any;
    color: string;
    suggestions: string[];
    showRetry: boolean;
    showHome: boolean;
    showBack: boolean;
  }
  
  function getErrorType(status: number): string {
    if (status >= 400 && status < 500) {
      return 'client';
    } else if (status >= 500) {
      return 'server';
    } else {
      return 'unknown';
    }
  }
  
  function getErrorConfig(type: string, status: number): ErrorConfig {
    const configs: Record<string, ErrorConfig> = {
      400: {
        title: 'Bad Request',
        description: 'The request could not be understood by the server.',
        icon: AlertTriangle,
        color: 'orange',
        suggestions: [
          'Check the URL for typos',
          'Ensure all required fields are filled',
          'Try refreshing the page'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      401: {
        title: 'Authentication Required',
        description: 'You need to sign in to access this page.',
        icon: Lock,
        color: 'blue',
        suggestions: [
          'Sign in to your account',
          'Check if your session has expired',
          'Contact support if you believe this is an error'
        ],
        showRetry: false,
        showHome: true,
        showBack: false
      },
      403: {
        title: 'Access Forbidden',
        description: "You don't have permission to access this resource.",
        icon: Lock,
        color: 'red',
        suggestions: [
          'Verify you have the correct permissions',
          'Contact an administrator',
          'Try signing in with a different account'
        ],
        showRetry: false,
        showHome: true,
        showBack: true
      },
      404: {
        title: 'Page Not Found',
        description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
        icon: Search,
        color: 'gray',
        suggestions: [
          'Check the URL for typos',
          'Use the search function',
          'Go back to the previous page',
          'Visit our homepage'
        ],
        showRetry: false,
        showHome: true,
        showBack: true
      },
      408: {
        title: 'Request Timeout',
        description: 'The request took too long to complete.',
        icon: Wifi,
        color: 'orange',
        suggestions: [
          'Check your internet connection',
          'Try again in a moment',
          'The server might be busy'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      429: {
        title: 'Too Many Requests',
        description: 'You have made too many requests. Please wait before trying again.',
        icon: AlertTriangle,
        color: 'orange',
        suggestions: [
          'Wait a few minutes before trying again',
          'Avoid rapid repeated requests',
          'Contact support if this continues'
        ],
        showRetry: false,
        showHome: true,
        showBack: true
      },
      500: {
        title: 'Internal Server Error',
        description: 'Something went wrong on our end. We apologize for the inconvenience.',
        icon: Server,
        color: 'red',
        suggestions: [
          'Try refreshing the page',
          'Wait a few minutes and try again',
          'Contact support if the problem persists'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      502: {
        title: 'Bad Gateway',
        description: 'Unable to connect to the server.',
        icon: Wifi,
        color: 'red',
        suggestions: [
          'Check your internet connection',
          'Try again in a few minutes',
          'The server might be temporarily down'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      503: {
        title: 'Service Unavailable',
        description: 'The service is temporarily unavailable. Please try again later.',
        icon: Server,
        color: 'orange',
        suggestions: [
          'Try again in a few minutes',
          'Check our status page for updates',
          'The service might be under maintenance'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      client: {
        title: 'Client Error',
        description: 'There was a problem with your request.',
        icon: AlertTriangle,
        color: 'orange',
        suggestions: [
          'Check your input and try again',
          'Refresh the page',
          'Contact support if the problem continues'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      server: {
        title: 'Server Error',
        description: 'Something went wrong on our end.',
        icon: Server,
        color: 'red',
        suggestions: [
          'Try again in a few minutes',
          'Contact support if the problem persists',
          'Check our status page for updates'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      },
      unknown: {
        title: 'Unexpected Error',
        description: 'An unexpected error has occurred.',
        icon: Bug,
        color: 'red',
        suggestions: [
          'Try refreshing the page',
          'Go back and try again',
          'Contact support with error details'
        ],
        showRetry: true,
        showHome: true,
        showBack: true
      }
    };
    
    return configs[status.toString()] || configs[type] || configs.unknown;
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
  
  function retry() {
    if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached');
      return;
    }
    
    retryCount++;
    if (browser) {
      window.location.reload();
    }
  }
  
  function toggleDetails() {
    showDetails = !showDetails;
  }
  
  async function copyErrorDetails() {
    if (!browser) return;
    
    const details = {
      status,
      message: errorMessage,
      url: $page.url.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'Direct'
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
  
  // Get color classes based on error type
  function getColorClasses(color: string) {
    const colors = {
      red: 'bg-red-100 text-red-600',
      orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colors[color as keyof typeof colors] || colors.red;
  }
</script>

<svelte:head>
  <title>Error {status}</title>
  <meta name="description" content="An error has occurred: {errorMessage}" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
  <Card class="max-w-2xl w-full">
    <CardHeader class="text-center">
      <!-- Error Icon -->
      <div class="w-20 h-20 {getColorClasses(errorConfig.color)} rounded-full flex items-center justify-center mx-auto mb-4">
        <svelte:component this={errorConfig.icon} class="w-10 h-10" />
      </div>
      
      <!-- Error Title and Status -->
      <div class="flex items-center justify-center gap-2 mb-2">
        <CardTitle class="text-2xl text-gray-900">{errorConfig.title}</CardTitle>
        <Badge variant="outline" class="text-sm">
          {status}
        </Badge>
      </div>
      
      <p class="text-gray-600 max-w-md mx-auto">
        {errorConfig.description}
      </p>
      
      {#if errorMessage !== errorConfig.description}
        <p class="text-sm text-gray-500 mt-2 italic">
          "{errorMessage}"
        </p>
      {/if}
    </CardHeader>
    
    <CardContent class="space-y-6">
      <!-- Suggestions -->
      {#if errorConfig.suggestions.length > 0}
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-medium text-blue-900 mb-3">What you can try:</h3>
          <ul class="space-y-2">
            {#each errorConfig.suggestions as suggestion}
              <li class="flex items-start gap-2 text-sm text-blue-800">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                {suggestion}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      
      <!-- Page Information -->
      <div class="text-sm text-gray-500 space-y-1">
        <p><strong>Requested URL:</strong> {$page.url.pathname}{$page.url.search}</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        {#if retryCount > 0}
          <p><strong>Retry attempts:</strong> {retryCount}/{maxRetries}</p>
        {/if}
      </div>
      
      <!-- Technical Details -->
      <div class="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          on:click={toggleDetails}
          class="w-full"
        >
          <Bug class="w-4 h-4 mr-2" />
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </Button>
        
        {#if showDetails}
          <div class="bg-gray-100 border rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-700">Error Information</span>
              <Button variant="ghost" size="sm" on:click={copyErrorDetails}>
                {#if copied}
                  <Check class="w-4 h-4" />
                {:else}
                  <Copy class="w-4 h-4" />
                {/if}
              </Button>
            </div>
            
            <div class="text-sm text-gray-600 space-y-1">
              <div><strong>Status Code:</strong> {status}</div>
              <div><strong>Error Type:</strong> {errorType}</div>
              <div><strong>Message:</strong> {errorMessage}</div>
              <div><strong>Path:</strong> {$page.url.pathname}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
              {#if browser}
                <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                <div><strong>Referrer:</strong> {document.referrer || 'Direct'}</div>
              {/if}
            </div>
            
            {#if error && error.stack}
              <details class="mt-3">
                <summary class="cursor-pointer text-gray-600 hover:text-gray-800 text-sm">
                  Stack Trace
                </summary>
                <pre class="mt-2 p-3 bg-gray-200 rounded text-xs overflow-auto whitespace-pre-wrap max-h-40">
{error.stack}
                </pre>
              </details>
            {/if}
          </div>
        {/if}
      </div>
    </CardContent>
    
    <!-- Action Buttons -->
    <CardFooter class="flex flex-col sm:flex-row gap-3">
      {#if errorConfig.showRetry && retryCount < maxRetries}
        <Button on:click={retry} class="flex-1">
          <RefreshCw class="w-4 h-4 mr-2" />
          Try Again
        </Button>
      {/if}
      
      <div class="flex gap-2 flex-1">
        {#if errorConfig.showBack}
          <Button variant="outline" on:click={goBack} class="flex-1">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Go Back
          </Button>
        {/if}
        
        {#if errorConfig.showHome}
          <Button variant="outline" on:click={goHome} class="flex-1">
            <Home class="w-4 h-4 mr-2" />
            Home
          </Button>
        {/if}
      </div>
      
      <!-- Special actions based on error type -->
      {#if status === 401}
        <Button href="/login" class="flex-1">
          <Lock class="w-4 h-4 mr-2" />
          Sign In
        </Button>
      {:else if status === 403}
        <Button href="/contact" variant="outline" class="flex-1">
          Contact Support
        </Button>
      {/if}
    </CardFooter>
  </Card>
</div>

<!-- Additional help text -->
<div class="text-center mt-6 text-sm text-gray-500">
  <p>
    Still having trouble? 
    <a href="/contact" class="text-blue-600 hover:underline">Contact our support team</a>
    or check our 
    <a href="/help" class="text-blue-600 hover:underline">help documentation</a>.
  </p>
</div>