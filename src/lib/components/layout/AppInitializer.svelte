<!--
  src/lib/components/layout/AppInitializer.svelte
  Application Initializer Component with Standardized Spinner
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import { initializationService } from '$lib/services/initialization';
  import { initializationStore } from '$lib/stores/initialization.store';
  import { loadingStore } from '$lib/stores/loading.store';
  import { initToastEventHandlers } from '$lib/services/toast';

  // Component props
  let {
    firebaseConfig,
    useEmulators = false,
    showLoading = true,
    loading,
    error: errorSnippet,
    children
  }: {
    firebaseConfig: any;
    useEmulators?: boolean;
    showLoading?: boolean;
    loading?: Snippet;
    error?: Snippet<[{ error: any; handleRetry: () => void }]>;
    children?: Snippet;
  } = $props();

  // Internal state
  let mounted: boolean = $state(false);
  let initializing: boolean = $state(false);
  let initialized: boolean = $state(false);
  let error: any = $state(null);
  let unsubscribe = () => {};

  // Initialize the application
  async function initialize(): Promise<void> {
    if (!browser || initializing || initialized) return;

    initializing = true;
    loadingStore.startLoading('app', 'initialization');

    try {
      // Initialize Firebase and auth services
      await initializationService.initialize({
        firebaseConfig,
        useEmulators
      });

      // Component preloading functionality removed (legacy Flowbite components)

      // Initialize toast event handlers to listen for application events
      initToastEventHandlers();

      initialized = true;
      error = null;
    } catch (err) {
      console.error('Application initialization failed:', err);
      error = err;
    } finally {
      initializing = false;
      loadingStore.endLoading('app', 'initialization');
    }
  }

  // Handle component lifecycle
  $effect(() => {
    mounted = true;

    // Subscribe to initialization state
    unsubscribe = initializationStore.subscribe(state => {
      if (!state) return;

      initialized = state.isInitialized || false;
      initializing = state.isInitializing || false;
      error = state.error || null;
    });

    // Initialize on mount
    if (browser && !initialized && !initializing) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  });

  // Compute loading state
  let isLoading = $derived(initializing || (!initialized && !error));

  // Handle retry
  function handleRetry(): void {
    if (browser && !initializing) {
      // Reset error state
      error = null;

      // Retry initialization
      initialize();
    }
  }
</script>

{#if isLoading && showLoading}
  <!-- Loading state -->
  <div class="app-initializer-loading">
    {#if loading}
      {@render loading()}
    {:else}
      <div class="flex flex-col items-center justify-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-sm text-gray-600">Initializing application...</p>
      </div>
    {/if}
  </div>
{:else if error}
  <!-- Error state -->
  <div class="app-initializer-error">
    {#if errorSnippet}
      {@render errorSnippet({ error, handleRetry })}
    {:else}
      <div class="error-container">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-rounded text-red-600 text-3xl">error</span>
        </div>
        <h3 class="text-lg font-medium text-gray-800 mb-2">Failed to Initialize Application</h3>
        <p class="text-gray-600 mb-4">{error.message || 'Unknown error occurred'}</p>
        <button
          onclick={handleRetry}
          class="py-2 px-4 bg-accent text-white rounded-lg flex items-center justify-center mx-auto"
          style="background-color: var(--accent);"
        >
          <span class="material-symbols-rounded mr-2">refresh</span>
          <span>Retry</span>
        </button>
      </div>
    {/if}
  </div>
{:else}
  <!-- Initialized state - render content -->
  {@render children?.()}
{/if}

<style>
  .app-initializer-loading,
  .app-initializer-error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 2rem;
    text-align: center;
  }

  .error-container {
    max-width: 400px;
    padding: 2rem;
    border-radius: 0.5rem;
    background-color: white;
    border: 1px solid #f3f4f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #374151;
    text-align: center;
  }

  /* Style for Material Symbols icons */
  :global(.material-symbols-rounded) {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 1.25rem;
    line-height: 1;
  }
</style>