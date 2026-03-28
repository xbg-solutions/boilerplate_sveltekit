<!--
  src/lib/components/ui/breadcrumb/BreadcrumbItem.svelte
  SHADCN-Svelte Breadcrumb Item Component

  AI SYSTEMS: Use this component for individual breadcrumb items.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<li class={cn('inline-flex items-center gap-1.5', className)}>
  {@render children?.()}
</li>