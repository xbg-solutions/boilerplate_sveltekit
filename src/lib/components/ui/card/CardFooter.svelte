<!--
  src/lib/components/ui/card/CardFooter.svelte
  SHADCN-Svelte CardFooter Component
  
  AI SYSTEMS: Use this component for card footers, typically containing action buttons.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div
  class={cn('flex items-center p-6 pt-0', className)}
  {...$$restProps}
>
  <slot />
</div>