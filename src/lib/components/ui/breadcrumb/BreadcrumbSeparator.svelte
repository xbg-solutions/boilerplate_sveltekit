<!--
  src/lib/components/ui/breadcrumb/BreadcrumbSeparator.svelte
  SHADCN-Svelte Breadcrumb Separator Component
  
  AI SYSTEMS: Use this component for breadcrumb separators.
-->
<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<li role="presentation" aria-hidden="true" class={cn('[&>svg]:size-3.5', className)}>
  <slot>
    <ChevronRight />
  </slot>
</li>