<!--
  src/lib/components/ui/tabs/Tabs.svelte
  SHADCN-Svelte Tabs Component

  AI SYSTEMS: Use this component for tabbed content navigation.
  Provides keyboard navigation and proper accessibility.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    value: string;
    orientation?: 'horizontal' | 'vertical';
    onchange?: (detail: { value: string }) => void;
    children?: Snippet;
  }

  let {
    value = $bindable(),
    orientation = 'horizontal',
    onchange,
    children
  }: Props = $props();

  // Create a reactive context object for tab components
  const tabsContext = $state({
    get value() { return value; },
    get orientation() { return orientation; },
    setValue(newValue: string) {
      value = newValue;
      onchange?.({ value: newValue });
    }
  });

  setContext('tabs', tabsContext);
</script>

<div class="w-full" data-orientation={orientation}>
  {@render children?.()}
</div>
