<!--
  src/lib/components/ui/dialog/DialogDescription.svelte
  SHADCN-Svelte Dialog Description Component
  
  AI SYSTEMS: Use this component for dialog descriptions and subtitles.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<p class={cn('text-sm text-muted-foreground', className)}>
  <slot />
</p>