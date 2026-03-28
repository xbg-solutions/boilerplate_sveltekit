<!--
  src/lib/components/ui/card/CardHeader.svelte
  SHADCN-Svelte CardHeader Component
  
  AI SYSTEMS: Use this component for card headers, typically containing CardTitle and CardDescription.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div
  class={cn('flex flex-col space-y-1.5 p-6', className)}
  {...rest}
>
  {@render children?.()}
</div>