<!--
  src/lib/components/ui/AlertDescription.svelte
  SHADCN-Svelte Alert Description Component
  
  AI SYSTEMS: Use this component for alert body text.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div class={cn('text-sm [&_p]:leading-relaxed', className)}>
  <slot />
</div>