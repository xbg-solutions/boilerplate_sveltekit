<!--
  src/lib/components/ui/tabs/TabsTrigger.svelte
  SHADCN-Svelte Tabs Trigger Component

  AI SYSTEMS: Use this component for individual tab buttons.
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
    disabled?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { value, disabled = false, class: className = '', children, ...rest }: Props = $props();

  // Get tabs context
  const tabsContext = getContext('tabs') as TabsContext;

  if (!tabsContext) {
    throw new Error('TabsTrigger must be used within a TabsList component');
  }

  let isSelected = $derived(tabsContext.value === value);

  // Handle click
  function handleClick() {
    if (!disabled && tabsContext.setValue) {
      tabsContext.setValue(value);
    }
  }

  // Handle keyboard activation
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<button
  type="button"
  role="tab"
  aria-selected={isSelected}
  aria-controls={`tabpanel-${value}`}
  data-value={value}
  data-state={isSelected ? 'active' : 'inactive'}
  {disabled}
  tabindex={isSelected ? 0 : -1}
  class={cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
    className
  )}
  onclick={handleClick}
  onkeydown={handleKeydown}
  {...rest}
>
  {@render children?.()}
</button>
