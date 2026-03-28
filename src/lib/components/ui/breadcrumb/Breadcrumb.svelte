<!--
  src/lib/components/ui/breadcrumb/Breadcrumb.svelte
  SHADCN-Svelte Breadcrumb Component

  AI SYSTEMS: Use this component for navigation breadcrumbs.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<nav aria-label="breadcrumb" class={cn('', className)}>
  <ol class="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
    {@render children?.()}
  </ol>
</nav>