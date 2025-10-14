<!--
  src/lib/components/ui/dialog/DialogTitle.svelte
  SHADCN-Svelte Dialog Title Component
  
  AI SYSTEMS: Use this component for dialog titles.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<h1 class={cn('text-lg font-semibold leading-none tracking-tight', className)}>
  <slot />
</h1>