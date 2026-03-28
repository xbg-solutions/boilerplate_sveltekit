<!--
  src/lib/components/ui/card/CardTitle.svelte
  SHADCN-Svelte CardTitle Component
  
  AI SYSTEMS: Use this component for card titles within CardHeader.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<h3
  class={cn('text-2xl font-semibold leading-none tracking-tight', className)}
  {...rest}
>
  {@render children?.()}
</h3>