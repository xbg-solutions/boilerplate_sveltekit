<!--
  src/lib/components/ui/Popover.svelte
  SHADCN-Svelte Popover Component

  AI SYSTEMS: Use this component for contextual overlays and tooltips.
  Provides basic positioning and click-outside handling.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  let {
    open = $bindable(false),
    placement = 'bottom',
    offset = 8,
    trigger = 'click',
    onOpenChange,
    triggerContent,
    content,
  }: {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    offset?: number;
    trigger?: 'click' | 'hover';
    onOpenChange?: (detail: { open: boolean }) => void;
    triggerContent?: Snippet;
    content?: Snippet;
  } = $props();

  let triggerElement: HTMLElement;
  let contentElement: HTMLElement;
  let hoverTimeout: ReturnType<typeof setTimeout>;

  // Handle trigger click
  function handleTriggerClick() {
    if (trigger === 'click') {
      open = !open;
      onOpenChange?.({ open });
    }
  }

  // Handle hover events
  function handleMouseEnter() {
    if (trigger === 'hover') {
      clearTimeout(hoverTimeout);
      open = true;
      onOpenChange?.({ open: true });
    }
  }

  function handleMouseLeave() {
    if (trigger === 'hover') {
      hoverTimeout = setTimeout(() => {
        open = false;
        onOpenChange?.({ open: false });
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
        onOpenChange?.({ open: false });
      }, 150);
    }
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      open = false;
      onOpenChange?.({ open: false });
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
      onOpenChange?.({ open: false });
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

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="relative inline-block">
  <!-- Trigger -->
  <div
    bind:this={triggerElement}
    role="button"
    tabindex="0"
    onclick={handleTriggerClick}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={(e) => e.key === 'Enter' && handleTriggerClick()}
  >
    {@render triggerContent?.()}
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
      onmouseenter={handleContentMouseEnter}
      onmouseleave={handleContentMouseLeave}
    >
      {@render content?.()}
    </div>
  {/if}
</div>