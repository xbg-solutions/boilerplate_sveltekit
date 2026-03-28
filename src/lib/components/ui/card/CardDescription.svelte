<!--
  src/lib/components/ui/card/CardDescription.svelte
  SHADCN-Svelte CardDescription Component
  
  AI SYSTEMS: Use this component for card descriptions within CardHeader.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<p
  class={cn('text-sm text-muted-foreground', className)}
  {...rest}
>
  {@render children?.()}
</p>