<!--
  src/lib/components/layout/PageTransition.svelte
  Page Transition Loader
  
  Shows a loading overlay during page navigation.
-->
<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Whether to show the loading overlay
  let isNavigating = false;
  let mounted = false;
  
  // Keep track of navigation
  beforeNavigate(() => {
    if (browser && mounted) {
      isNavigating = true;
    }
  });
  
  afterNavigate(() => {
    if (browser) {
      isNavigating = false;
    }
  });
  
  onMount(() => {
    mounted = true;
  });
</script>

{#if isNavigating}
  <div 
    class="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 200 }}
  >
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
{/if}