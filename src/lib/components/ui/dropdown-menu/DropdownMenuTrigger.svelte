<!--
  Dropdown Menu Trigger Component
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    children,
    ...rest
  }: {
    children?: Snippet;
    [key: string]: any;
  } = $props();

  const dropdown = getContext('dropdown') as any;

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    dropdown?.toggle();
  }
</script>

<!--
  Use display:contents so this wrapper is invisible in the layout while still
  capturing click events that bubble up from child buttons.
-->
<span onclick={handleClick} style="display: contents" {...rest}>
  {@render children?.()}
</span>
