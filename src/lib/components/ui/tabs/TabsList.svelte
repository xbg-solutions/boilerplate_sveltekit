<!--
  src/lib/components/ui/tabs/TabsList.svelte
  SHADCN-Svelte Tabs List Component
  
  AI SYSTEMS: Use this component as the container for tab triggers.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import type { Writable } from 'svelte/store';

  let className: string = '';
  export { className as class };

  // Get tabs context
  const tabsContext = getContext('tabs') as Writable<{
    value: string;
    orientation: 'horizontal' | 'vertical';
    setValue: (value: string) => void;
  }>;

  if (!tabsContext) {
    throw new Error('TabsList must be used within a Tabs component');
  }

  $: ({ orientation } = $tabsContext);

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    const triggers = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll('[role="tab"]')
    ) as HTMLElement[];

    const currentIndex = triggers.findIndex(trigger => trigger === event.target);
    let nextIndex = currentIndex;

    const isHorizontal = orientation === 'horizontal';

    switch (event.key) {
      case isHorizontal ? 'ArrowRight' : 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % triggers.length;
        break;
      case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? triggers.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = triggers.length - 1;
        break;
      default:
        return;
    }

    // Focus and select the next tab
    const nextTrigger = triggers[nextIndex];
    if (nextTrigger) {
      nextTrigger.focus();
      const tabValue = nextTrigger.getAttribute('data-value');
      if (tabValue && $tabsContext.setValue) {
        $tabsContext.setValue(tabValue);
      }
    }
  }
</script>

<div
  class={cn(
    'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    orientation === 'vertical' && 'flex-col h-auto',
    orientation === 'horizontal' && 'h-10',
    className
  )}
  role="tablist"
  data-orientation={orientation}
  tabindex="0"
  on:keydown={handleKeydown}
>
  <slot />
</div>