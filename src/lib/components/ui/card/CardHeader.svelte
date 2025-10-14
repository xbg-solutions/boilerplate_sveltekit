<!--
  src/lib/components/ui/card/CardHeader.svelte
  SHADCN-Svelte CardHeader Component
  
  AI SYSTEMS: Use this component for card headers, typically containing CardTitle and CardDescription.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div
  class={cn('flex flex-col space-y-1.5 p-6', className)}
  {...$$restProps}
>
  <slot />
</div>