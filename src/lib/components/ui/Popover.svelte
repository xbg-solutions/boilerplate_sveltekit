<!--
  src/lib/components/ui/Popover.svelte
  SHADCN-Svelte Popover Component
  
  AI SYSTEMS: Use this component for contextual overlays and tooltips.
  Provides basic positioning and click-outside handling.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  export let open: boolean = false;
  export let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  export const offset: number = 8;
  export let trigger: 'click' | 'hover' = 'click';

  let triggerElement: HTMLElement;
  let contentElement: HTMLElement;
  let hoverTimeout: ReturnType<typeof setTimeout>;

  const dispatch = createEventDispatcher<{
    'open-change': { open: boolean };
  }>();

  // Handle trigger click
  function handleTriggerClick() {
    if (trigger === 'click') {
      open = !open;
      dispatch('open-change', { open });
    }
  }

  // Handle hover events
  function handleMouseEnter() {
    if (trigger === 'hover') {
      clearTimeout(hoverTimeout);
      open = true;
      dispatch('open-change', { open: true });
    }
  }

  function handleMouseLeave() {
    if (trigger === 'hover') {
      hoverTimeout = setTimeout(() => {
        open = false;
        dispatch('open-change', { open: false });
      }, 150);
    }
  }

  function handleContentMouseEnter() {
    if (trigger === 'hover') {
      clearTimeout(hoverTimeout);
    }
  }

  function handleContentMouseLeave() {
    if (trigger === 'hover') {
      hoverTimeout = setTimeout(() => {
        open = false;
        dispatch('open-change', { open: false });
      }, 150);
    }
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      open = false;
      dispatch('open-change', { open: false });
      triggerElement?.focus();
    }
  }

  // Close on click outside
  function handleClickOutside(event: MouseEvent) {
    if (
      triggerElement &&
      contentElement &&
      !triggerElement.contains(event.target as Node) &&
      !contentElement.contains(event.target as Node)
    ) {
      open = false;
      dispatch('open-change', { open: false });
    }
  }

  // Get positioning classes
  function getPositionClasses(placement: string) {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
      default:
        return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="relative inline-block">
  <!-- Trigger -->
  <div
    bind:this={triggerElement}
    role="button"
    tabindex="0"
    on:click={handleTriggerClick}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:keydown={(e) => e.key === 'Enter' && handleTriggerClick()}
  >
    <slot name="trigger" />
  </div>

  <!-- Content -->
  {#if open}
    <div
      bind:this={contentElement}
      class={cn(
        'absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        getPositionClasses(placement)
      )}
      data-state={open ? 'open' : 'closed'}
      role="tooltip"
      on:mouseenter={handleContentMouseEnter}
      on:mouseleave={handleContentMouseLeave}
    >
      <slot name="content" />
    </div>
  {/if}
</div>