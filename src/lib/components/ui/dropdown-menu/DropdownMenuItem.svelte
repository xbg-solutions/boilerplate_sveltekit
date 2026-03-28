<!--
  Dropdown Menu Item Component
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    disabled = false,
    children,
    ...rest
  }: {
    class?: string;
    disabled?: boolean;
    children?: Snippet;
    [key: string]: any;
  } = $props();

  const dropdown = getContext('dropdown') as any;

  function handleClick() {
    if (!disabled) {
      dropdown?.close();
    }
  }
</script>

<button
  type="button"
  class={cn(
    'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  )}
  {disabled}
  onclick={handleClick}
  {...rest}
>
  {@render children?.()}
</button>
