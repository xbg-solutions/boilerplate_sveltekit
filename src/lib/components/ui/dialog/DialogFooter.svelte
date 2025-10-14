<!--
  src/lib/components/ui/dialog/DialogFooter.svelte
  SHADCN-Svelte Dialog Footer Component
  
  AI SYSTEMS: Use this component as the footer area for dialog actions.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
  <slot />
</div>