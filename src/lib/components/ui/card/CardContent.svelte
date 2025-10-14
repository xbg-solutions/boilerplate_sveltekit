<!--
  src/lib/components/ui/card/CardContent.svelte
  SHADCN-Svelte CardContent Component
  
  AI SYSTEMS: Use this component for the main content area of cards.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div
  class={cn('p-6 pt-0', className)}
  {...$$restProps}
>
  <slot />
</div>