<!--
  src/lib/components/diagnostics/InitializationStatus.svelte
  Initialization Status Component
  
  Displays the current initialization status of the application.
  Useful for development and debugging.
-->
<script lang="ts">
  import { initializationStore } from '$lib/stores/initialization.store';
  import { Alert, AlertDescription, Badge } from '$lib/components/ui';
  
  // Reactive values from initialization state
  $: isInitialized = $initializationStore.isInitialized;
  $: isInitializing = $initializationStore.isInitializing;
  $: error = $initializationStore.error;
  $: services = $initializationStore.services;
  
  // Helper function to get badge variant
  function getBadgeVariant(status: boolean): "default" | "secondary" | "destructive" | "outline" {
    return status ? "default" : "destructive";
  }
</script>

<div class="initialization-status mt-4 mb-4">
  <h3 class="text-lg font-semibold mb-2">Initialization Status</h3>
  
  <div class="services-status mb-4">
    <h4 class="text-base font-semibold mb-2">Firebase Services</h4>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="service-item">
        <span>Firebase App:</span>
        <Badge variant={getBadgeVariant(services.app)}>
          {services.app ? 'Initialized' : 'Not initialized'}
        </Badge>
      </div>
      
      <div class="service-item">
        <span>Firebase Auth:</span>
        <Badge variant={getBadgeVariant(services.auth)}>
          {services.auth ? 'Initialized' : 'Not initialized'}
        </Badge>
      </div>
    </div>
  </div>
  
  <div class="overall-status mt-4">
    {#if isInitializing}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="font-medium text-blue-800">
          Initializing services...
        </AlertDescription>
      </Alert>
    {:else if isInitialized}
      <Alert className="border-green-200 bg-green-50">
        <AlertDescription className="font-medium text-green-800">
          Initialization complete!
        </AlertDescription>
      </Alert>
    {:else if error}
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          <span class="font-medium">Initialization failed!</span>
          <p class="mt-2">{error.message}</p>
        </AlertDescription>
      </Alert>
    {:else}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertDescription className="font-medium text-yellow-800">
          Initialization not started
        </AlertDescription>
      </Alert>
    {/if}
  </div>
</div>

<style>
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>