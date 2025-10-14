<!--
  Error Boundary Test Component
  
  A utility component for testing error boundaries in development.
  Provides buttons to trigger different types of errors.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Bug, AlertTriangle, Zap, Network } from 'lucide-svelte';
  
  export let level: 'page' | 'component' | 'global' = 'component';
  
  const dispatch = createEventDispatcher<{
    error: { type: string; error: Error };
  }>();
  
  let errorCount = 0;
  
  function triggerSyncError() {
    errorCount++;
    const error = new Error(`Synchronous Error #${errorCount}`);
    dispatch('error', { type: 'sync', error });
    throw error;
  }
  
  async function triggerAsyncError() {
    errorCount++;
    const error = new Error(`Asynchronous Error #${errorCount}`);
    dispatch('error', { type: 'async', error });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    throw error;
  }
  
  function triggerNetworkError() {
    errorCount++;
    const error = new Error(`Network Error #${errorCount}: Failed to fetch data`);
    error.name = 'NetworkError';
    dispatch('error', { type: 'network', error });
    throw error;
  }
  
  function triggerChunkLoadError() {
    errorCount++;
    const error = new Error(`ChunkLoadError #${errorCount}: Loading chunk failed`);
    error.name = 'ChunkLoadError';
    dispatch('error', { type: 'chunk', error });
    throw error;
  }
  
  function triggerAuthError() {
    errorCount++;
    const error = new Error(`Authentication Error #${errorCount}: User not authorized`);
    error.name = 'AuthError';
    dispatch('error', { type: 'auth', error });
    throw error;
  }
  
  function triggerCustomError() {
    errorCount++;
    const error = new Error(`Custom Error #${errorCount}: Something went wrong in component`);
    error.name = 'CustomError';
    // Add custom properties
    (error as any).code = 'CUSTOM_ERROR';
    (error as any).details = { component: 'ErrorBoundaryTest', level };
    dispatch('error', { type: 'custom', error });
    throw error;
  }
  
  function triggerUnhandledPromise() {
    errorCount++;
    // Create unhandled promise rejection
    Promise.reject(new Error(`Unhandled Promise Rejection #${errorCount}`));
  }
  
  function triggerConsoleError() {
    errorCount++;
    console.error(`Console Error #${errorCount}`, new Error('Test console error'));
  }
</script>

<Card class="max-w-2xl">
  <CardHeader>
    <div class="flex items-center gap-2">
      <Bug class="w-5 h-5 text-orange-600" />
      <CardTitle class="text-lg">Error Boundary Test</CardTitle>
      <Badge variant="outline">{level}</Badge>
    </div>
    <Alert>
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>
        Use these buttons to test error boundary behavior. Each button triggers a different type of error.
      </AlertDescription>
    </Alert>
  </CardHeader>
  
  <CardContent class="space-y-4">
    <!-- Synchronous Errors -->
    <div class="space-y-2">
      <h3 class="font-medium text-sm text-gray-700 flex items-center gap-2">
        <Zap class="w-4 h-4" />
        Synchronous Errors
      </h3>
      <div class="flex flex-wrap gap-2">
        <Button 
          variant="destructive" 
          size="sm" 
          on:click={triggerSyncError}
        >
          Sync Error
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          on:click={triggerCustomError}
        >
          Custom Error
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          on:click={triggerAuthError}
        >
          Auth Error
        </Button>
      </div>
    </div>
    
    <!-- Asynchronous Errors -->
    <div class="space-y-2">
      <h3 class="font-medium text-sm text-gray-700 flex items-center gap-2">
        <Network class="w-4 h-4" />
        Asynchronous Errors
      </h3>
      <div class="flex flex-wrap gap-2">
        <Button 
          variant="destructive" 
          size="sm" 
          on:click={triggerAsyncError}
        >
          Async Error
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          on:click={triggerNetworkError}
        >
          Network Error
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          on:click={triggerChunkLoadError}
        >
          Chunk Error
        </Button>
      </div>
    </div>
    
    <!-- Global Errors -->
    <div class="space-y-2">
      <h3 class="font-medium text-sm text-gray-700">Global Errors</h3>
      <div class="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          on:click={triggerUnhandledPromise}
        >
          Unhandled Promise
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          on:click={triggerConsoleError}
        >
          Console Error
        </Button>
      </div>
    </div>
    
    <!-- Error Counter -->
    {#if errorCount > 0}
      <div class="pt-2 border-t">
        <p class="text-sm text-gray-600">
          Errors triggered: <Badge variant="secondary">{errorCount}</Badge>
        </p>
      </div>
    {/if}
  </CardContent>
</Card>

<style>
  :global(.error-boundary-test) {
    border: 2px dashed #fbbf24;
    background: #fffbeb;
  }
</style>