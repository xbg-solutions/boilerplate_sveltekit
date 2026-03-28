<!--
  src/lib/components/ui/breadcrumb/BreadcrumbSeparator.svelte
  SHADCN-Svelte Breadcrumb Separator Component

  AI SYSTEMS: Use this component for breadcrumb separators.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChevronRight } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<li role="presentation" aria-hidden="true" class={cn('[&>svg]:size-3.5', className)}>
  {#if children}
    {@render children()}
  {:else}
    <ChevronRight />
  {/if}
</li>