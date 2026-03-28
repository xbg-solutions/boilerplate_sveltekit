<!--
  src/lib/components/layout/DeferredRender.svelte
  Deferred Render Component

  Utility component that implements staged rendering:
  1. Shows a placeholder/skeleton during initial render
  2. Can delay rendering to improve initial load performance
  3. Supports different loading states
-->
<script lang="ts">
    import type { Snippet } from 'svelte';
    import { tick } from 'svelte';

    // Component props
    let {
      delay = 0,
      placeholder = null,
      loading = false,
      mounted = false,
      condition = true,
      id = '',
      showFallback = true,
      fallback,
      children
    }: {
      delay?: number;
      placeholder?: any;
      loading?: boolean;
      mounted?: boolean;
      condition?: boolean;
      id?: string;
      showFallback?: boolean;
      fallback?: Snippet;
      children?: Snippet;
    } = $props();

    // Internal state
    let ready: boolean = $state(false);
    let internalMounted: boolean = $state(false);

    // Compute overall ready state
    let isReady = $derived(Boolean(ready && (mounted || internalMounted) && !loading && condition));

    // Setup component lifecycle
    $effect(() => {
      internalMounted = true;

      let cancelled = false;

      async function init() {
        // Apply delay if specified
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (cancelled) return;

        // Use tick to ensure DOM is updated
        await tick();

        if (cancelled) return;

        // Mark component as ready
        ready = true;
      }

      init();

      return () => {
        cancelled = true;
      };
    });
  </script>

  {#if isReady}
    <!-- Render the actual content when ready -->
    {@render children?.()}
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
      {#if fallback}
        {@render fallback()}
      {:else}
        <div class="deferred-placeholder" aria-hidden="true">
          <div class="deferred-pulse"></div>
        </div>
      {/if}
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