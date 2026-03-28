<!--
  Alert Title Component
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  } = $props();
</script>

<h5 class={cn('mb-1 font-medium leading-none tracking-tight', className)} {...rest}>
  {@render children?.()}
</h5>