<!--
  src/lib/components/layout/ClientOnly.svelte
  Client-Only Component
  
  A component that ensures content only renders in the browser:
  1. Prevents SSR rendering completely
  2. Ensures DOM access is safe
  3. Controls mounting flow for child components
-->
<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    // Component props
    export let fallback: any = null;     // Optional fallback to show until mounted
    export let delayMs: number = 0;      // Optional delay before showing content
    export let showFallback: boolean = true; // Whether to show fallback content
    
    // Internal state
    let mounted: boolean = false;
    let delayed: boolean = delayMs > 0;
    
    // Handle component lifecycle
    onMount(async () => {
      // Set mounted state immediately
      mounted = true;
      
      // Apply delay if specified
      if (delayed) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayed = false;
      }
    });
    
    // Only render in browser and when mounted
    $: shouldRender = browser && mounted && !delayed;
  </script>
  
  {#if shouldRender}
    <slot />
  {:else if showFallback && browser}
    <!-- Show fallback in browser context -->
    {#if fallback}
      {#if typeof fallback === 'object'}
        <svelte:component this={fallback} />
      {:else}
        {fallback}
      {/if}
    {:else}
      <slot name="fallback">
        <!-- Default subtle loading state -->
        <div class="client-only-placeholder" aria-hidden="true"></div>
      </slot>
    {/if}
  {/if}
  
  <style>
    .client-only-placeholder {
      min-height: 1rem;
    }
  </style>