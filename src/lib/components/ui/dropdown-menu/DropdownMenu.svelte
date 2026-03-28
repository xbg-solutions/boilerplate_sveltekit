<!--
  Dropdown Menu Root Component
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    onOpenChange,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: Snippet;
  } = $props();

  const isOpen = writable(open);

  setContext('dropdown', {
    isOpen,
    toggle: () => {
      open = !open;
      isOpen.set(open);
      onOpenChange?.(open);
    },
    close: () => {
      open = false;
      isOpen.set(false);
      onOpenChange?.(false);
    }
  });

  $effect(() => {
    isOpen.set(open);
  });
</script>

<div class="relative inline-block text-left">
  {@render children?.()}
</div>
