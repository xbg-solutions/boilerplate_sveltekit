<!--
  src/lib/components/ui/dialog/Dialog.svelte
  SHADCN-Svelte Dialog Component

  AI SYSTEMS: Use this component for modal dialogs.
  Provides proper focus management, keyboard navigation, and accessibility.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  let {
    open = $bindable(false),
    closeOnEscape = true,
    closeOnClickOutside = true,
    preventScroll = true,
    onOpenChange,
    onClose,
    children,
  }: {
    open?: boolean;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    preventScroll?: boolean;
    onOpenChange?: (detail: { open: boolean }) => void;
    onClose?: () => void;
    children?: Snippet;
  } = $props();

  let dialogElement: HTMLDivElement;
  let contentElement: HTMLDivElement;
  let previousActiveElement: Element | null = $state(null);
  let isAnimating = $state(false);

  // Handle open state changes
  $effect(() => {
    if (open) {
      openDialog();
    } else {
      closeDialog();
    }
  });

  function openDialog() {
    if (isAnimating) return;

    previousActiveElement = document.activeElement;
    isAnimating = true;

    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Focus the dialog content after animation
    setTimeout(() => {
      contentElement?.focus();
      isAnimating = false;
    }, 150);
  }

  function closeDialog() {
    if (isAnimating) return;

    isAnimating = true;

    if (preventScroll) {
      document.body.style.overflow = '';
    }

    // Restore focus after animation
    setTimeout(() => {
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
      previousActiveElement = null;
      isAnimating = false;
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
    if (closeOnClickOutside && event.target === dialogElement) {
      handleClose();
    }
  }

  // Close dialog
  function handleClose() {
    open = false;
    onOpenChange?.({ open: false });
    onClose?.();
  }

  // Focus trap
  function handleFocus(event: FocusEvent) {
    if (!contentElement) return;

    const focusableElements = contentElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.target === contentElement) {
      firstFocusable?.focus();
    }
  }

  // Trap focus within dialog
  function trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !contentElement) return;

    const focusableElements = Array.from(
      contentElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  // Cleanup on destroy
  $effect(() => {
    return () => {
      if (preventScroll && open) {
        document.body.style.overflow = '';
      }
    };
  });
</script>

{#if open}
  <!-- Backdrop -->
  <div
    bind:this={dialogElement}
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-state={open ? 'open' : 'closed'}
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Dialog Content -->
    <div
      bind:this={contentElement}
      class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full"
      data-state={open ? 'open' : 'closed'}
    >
      {@render children?.()}
    </div>
  </div>
{/if}
