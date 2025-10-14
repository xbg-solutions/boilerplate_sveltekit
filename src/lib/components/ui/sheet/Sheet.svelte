<!--
  src/lib/components/ui/sheet/Sheet.svelte
  SHADCN-Svelte Sheet Component
  
  AI SYSTEMS: Use this component for slide-out panels and drawers.
  Supports different positions and proper accessibility.
-->
<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';
  import { tv, type VariantProps } from 'tailwind-variants';

  const sheetVariants = tv({
    base: 'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  });

  type SheetSide = VariantProps<typeof sheetVariants>['side'];

  // Component props
  export let open: boolean = false;
  export let side: SheetSide = 'right';
  export let closeOnEscape: boolean = true;
  export let closeOnClickOutside: boolean = true;
  export let preventScroll: boolean = true;

  let sheetElement: HTMLDivElement;
  let contentElement: HTMLDivElement;
  let previousActiveElement: Element | null = null;

  const dispatch = createEventDispatcher<{
    'open-change': { open: boolean };
    close: void;
  }>();

  // Handle open state changes
  $: if (open) {
    openSheet();
  } else {
    closeSheet();
  }

  function openSheet() {
    previousActiveElement = document.activeElement;
    
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Focus the sheet content
    setTimeout(() => {
      contentElement?.focus();
    }, 150);
  }

  function closeSheet() {
    if (preventScroll) {
      document.body.style.overflow = '';
    }

    // Restore focus
    setTimeout(() => {
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
      previousActiveElement = null;
    }, 150);
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      handleClose();
    }
  }

  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (closeOnClickOutside && event.target === sheetElement) {
      handleClose();
    }
  }

  // Close sheet
  function handleClose() {
    open = false;
    dispatch('open-change', { open: false });
    dispatch('close');
  }

  onDestroy(() => {
    if (preventScroll && open) {
      document.body.style.overflow = '';
    }
  });
</script>

{#if open}
  <!-- Backdrop -->
  <div
    bind:this={sheetElement}
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-state={open ? 'open' : 'closed'}
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Sheet Content -->
    <div
      bind:this={contentElement}
      class={cn(sheetVariants({ side }))}
      data-state={open ? 'open' : 'closed'}
      tabindex="-1"
    >
      <slot />
      
      <!-- Close button -->
      <button
        type="button"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        on:click={handleClose}
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>
    </div>
  </div>
{/if}