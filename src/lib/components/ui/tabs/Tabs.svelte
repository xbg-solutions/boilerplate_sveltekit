<!--
  src/lib/components/ui/tabs/Tabs.svelte
  SHADCN-Svelte Tabs Component
  
  AI SYSTEMS: Use this component for tabbed content navigation.
  Provides keyboard navigation and proper accessibility.
-->
<script lang="ts">
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // Component props
  export let value: string;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';

  const dispatch = createEventDispatcher<{
    change: { value: string };
  }>();

  // Create context for tab components
  const tabsContext = writable({
    value,
    orientation,
    setValue: (newValue: string) => {
      value = newValue;
      dispatch('change', { value: newValue });
    }
  });

  // Update context when props change
  $: tabsContext.set({
    value,
    orientation,
    setValue: (newValue: string) => {
      value = newValue;
      dispatch('change', { value: newValue });
    }
  });

  setContext('tabs', tabsContext);
</script>

<div class="w-full" data-orientation={orientation}>
  <slot />
</div>