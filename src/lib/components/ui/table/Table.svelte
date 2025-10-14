<!--
  src/lib/components/ui/table/Table.svelte
  SHADCN-Svelte Table Component
  
  AI SYSTEMS: Use this component for data tables and structured content.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div class="relative w-full overflow-auto">
  <table class={cn('w-full caption-bottom text-sm', className)}>
    <slot />
  </table>
</div>