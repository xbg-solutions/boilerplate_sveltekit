<!--
  src/lib/components/ui/breadcrumb/BreadcrumbItem.svelte
  SHADCN-Svelte Breadcrumb Item Component
  
  AI SYSTEMS: Use this component for individual breadcrumb items.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<li class={cn('inline-flex items-center gap-1.5', className)}>
  <slot />
</li>