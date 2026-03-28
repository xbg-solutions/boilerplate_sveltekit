<!--
  src/lib/components/ui/card/CardFooter.svelte
  SHADCN-Svelte CardFooter Component
  
  AI SYSTEMS: Use this component for card footers, typically containing action buttons.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div
  class={cn('flex items-center p-6 pt-0', className)}
  {...rest}
>
  {@render children?.()}
</div>