<!--
  Dropdown Menu Content Component
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  } = $props();

  const dropdown = getContext('dropdown') as any;
  let contentElement: HTMLElement | undefined = $state(undefined);

  function handleClickOutside(event: MouseEvent) {
    if (contentElement && !contentElement.contains(event.target as Node)) {
      dropdown?.close();
    }
  }

  $effect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

{#if $dropdown.isOpen}
  <div
    bind:this={contentElement}
    class={cn(
      'absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
      className
    )}
    {...rest}
  >
    <div class="py-1">
      {@render children?.()}
    </div>
  </div>
{/if}
