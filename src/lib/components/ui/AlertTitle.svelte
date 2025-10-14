<!--
  src/lib/components/ui/AlertTitle.svelte
  SHADCN-Svelte Alert Title Component
  
  AI SYSTEMS: Use this component for alert headings.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<h5 class={cn('mb-1 font-medium leading-none tracking-tight', className)}>
  <slot />
</h5>