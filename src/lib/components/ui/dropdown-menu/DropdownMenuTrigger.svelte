<!--
  Dropdown Menu Trigger Component
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    builders = [],
    asChild = false,
    children,
    ...rest
  }: {
    builders?: any[];
    asChild?: boolean;
    children?: Snippet;
    [key: string]: any;
  } = $props();

  const dropdown = getContext('dropdown') as any;

  function handleClick() {
    dropdown?.toggle();
  }
</script>

{#if asChild}
  {@render children?.()}
{:else}
  <button type="button" onclick={handleClick} {...rest}>
    {@render children?.()}
  </button>
{/if}
