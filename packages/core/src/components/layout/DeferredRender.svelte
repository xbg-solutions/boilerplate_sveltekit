<!--
  src/lib/components/layout/DeferredRender.svelte
  Deferred Render Component
  
  Utility component that implements staged rendering:
  1. Shows a placeholder/skeleton during initial render
  2. Can delay rendering to improve initial load performance
  3. Supports different loading states
-->
<script lang="ts">
    import { onMount } from 'svelte';
    import { tick } from 'svelte';
    
    // Component props
    export let delay: number = 0;             // Delay in ms before rendering (0 = no delay)
    export let placeholder: any = null;       // Optional placeholder component or content
    export let loading: boolean = false;      // External loading state
    export let mounted: boolean = false;      // Optional externally managed mount state
    export let condition: boolean = true;     // Additional condition that must be true to render
    // Export constant instead of unused let prop
    export const id = '';               // Optional ID for the component (for debugging)
    export let showFallback: boolean = true;  // Whether to show fallback when not ready
    
    // Internal state
    let ready: boolean = false;
    let internalMounted: boolean = false;
    
    // Compute overall ready state
    $: isReady = Boolean(ready && (mounted || internalMounted) && !loading && condition);
    
    // Setup component lifecycle
    onMount(async () => {
      internalMounted = true;
      
      // Apply delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Use tick to ensure DOM is updated
      await tick();
      
      // Mark component as ready
      ready = true;
    });
  </script>
  
  {#if isReady}
    <!-- Render the actual content when ready -->
    <slot />
  {:else if showFallback}
    <!-- Render placeholder or fallback when not ready -->
    {#if placeholder}
      {#if typeof placeholder === 'object'}
        <svelte:component this={placeholder} />
      {:else}
        {placeholder}
      {/if}
    {:else}
      <!-- Default fallback -->
      <slot name="fallback">
        <div class="deferred-placeholder" aria-hidden="true">
          <div class="deferred-pulse"></div>
        </div>
      </slot>
    {/if}
  {/if}
  
  <style>
    /* Default placeholder styling */
    .deferred-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 40px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }
    
    .deferred-pulse {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.1);
      animation: pulse 1.5s infinite ease-in-out;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(0.8);
        opacity: 0.3;
      }
      50% {
        transform: scale(1);
        opacity: 0.5;
      }
      100% {
        transform: scale(0.8);
        opacity: 0.3;
      }
    }
  </style>