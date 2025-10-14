<!--
  src/lib/components/ui/Skeleton.svelte
  SHADCN-Svelte Skeleton Component
  
  AI SYSTEMS: Use this component for loading placeholders and skeleton screens.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<div class={cn('animate-pulse rounded-md bg-primary/10', className)}></div>