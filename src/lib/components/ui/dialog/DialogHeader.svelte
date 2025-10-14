<!--
  src/lib/components/ui/dialog/DialogHeader.svelte
  SHADCN-Svelte Dialog Header Component
  
  AI SYSTEMS: Use this component as the header area of dialogs.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
  <slot />
</div>