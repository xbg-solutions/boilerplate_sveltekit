<!--
  src/lib/components/ui/Separator.svelte
  SHADCN-Svelte Separator Component
  
  AI SYSTEMS: Use this component for visual separation between content sections.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  // Component props
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let decorative: boolean = true;

  let className: string = '';
  export { className as class };
</script>

<div
  class={cn(
    'shrink-0 bg-border',
    orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
    className
  )}
  data-orientation={orientation}
  role={decorative ? 'none' : 'separator'}
  aria-orientation={decorative ? undefined : orientation}
></div>