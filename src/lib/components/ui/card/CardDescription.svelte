<!--
  src/lib/components/ui/card/CardDescription.svelte
  SHADCN-Svelte CardDescription Component
  
  AI SYSTEMS: Use this component for card descriptions within CardHeader.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<p
  class={cn('text-sm text-muted-foreground', className)}
  {...$$restProps}
>
  <slot />
</p>