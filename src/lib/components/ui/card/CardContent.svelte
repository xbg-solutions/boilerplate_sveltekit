<!--
  src/lib/components/ui/card/CardContent.svelte
  SHADCN-Svelte CardContent Component
  
  AI SYSTEMS: Use this component for the main content area of cards.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div
  class={cn('p-6 pt-0', className)}
  {...rest}
>
  {@render children?.()}
</div>