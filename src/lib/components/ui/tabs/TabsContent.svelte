<!--
  src/lib/components/ui/tabs/TabsContent.svelte
  SHADCN-Svelte Tabs Content Component

  AI SYSTEMS: Use this component for tab panel content.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface TabsContext {
    value: string;
    orientation: 'horizontal' | 'vertical';
    setValue: (value: string) => void;
  }

  interface Props {
    value: string;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { value, class: className = '', children, ...rest }: Props = $props();

  // Get tabs context
  const tabsContext = getContext('tabs') as TabsContext;

  if (!tabsContext) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  let isSelected = $derived(tabsContext.value === value);
</script>

{#if isSelected}
  <div
    role="tabpanel"
    id={`tabpanel-${value}`}
    aria-labelledby={`tab-${value}`}
    data-state={isSelected ? 'active' : 'inactive'}
    tabindex="0"
    class={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...rest}
  >
    {@render children?.()}
  </div>
{/if}
