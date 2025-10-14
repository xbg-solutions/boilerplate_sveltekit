<!--
  Dropdown Menu Root Component
-->
<script lang="ts">
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  
  export let open = false;
  
  const dispatch = createEventDispatcher<{
    openChange: boolean;
  }>();
  
  const isOpen = writable(open);
  
  setContext('dropdown', {
    isOpen,
    toggle: () => {
      open = !open;
      isOpen.set(open);
      dispatch('openChange', open);
    },
    close: () => {
      open = false;
      isOpen.set(false);
      dispatch('openChange', false);
    }
  });
  
  $: isOpen.set(open);
</script>

<div class="relative inline-block text-left">
  <slot />
</div>