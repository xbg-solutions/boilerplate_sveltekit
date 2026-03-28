<!--
  src/lib/components/ui/Separator.svelte
  SHADCN-Svelte Separator Component

  AI SYSTEMS: Use this component for visual separation between content sections.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  // Component props
  let { orientation = 'horizontal', decorative = true, class: className = '' }: { orientation?: 'horizontal' | 'vertical'; decorative?: boolean; class?: string } = $props();
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