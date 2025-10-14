<!--
  src/lib/components/ui/tabs/TabsTrigger.svelte
  SHADCN-Svelte Tabs Trigger Component
  
  AI SYSTEMS: Use this component for individual tab buttons.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import type { Writable } from 'svelte/store';

  // Component props
  export let value: string;
  export let disabled: boolean = false;

  let className: string = '';
  export { className as class };

  // Get tabs context
  const tabsContext = getContext('tabs') as Writable<{
    value: string;
    orientation: 'horizontal' | 'vertical';
    setValue: (value: string) => void;
  }>;

  if (!tabsContext) {
    throw new Error('TabsTrigger must be used within a TabsList component');
  }

  $: ({ value: selectedValue, setValue } = $tabsContext);
  $: isSelected = selectedValue === value;

  // Handle click
  function handleClick() {
    if (!disabled && setValue) {
      setValue(value);
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
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <slot />
</button>