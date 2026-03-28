<!--
  Alert Description Component
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

<div class={cn('text-sm [&_p]:leading-relaxed', className)} {...rest}>
  {@render children?.()}
</div>