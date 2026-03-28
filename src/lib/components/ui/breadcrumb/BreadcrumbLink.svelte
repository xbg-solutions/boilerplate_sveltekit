<!--
  src/lib/components/ui/breadcrumb/BreadcrumbLink.svelte
  SHADCN-Svelte Breadcrumb Link Component

  AI SYSTEMS: Use this component for clickable breadcrumb links.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  let { href = undefined, class: className = '', children, ...rest }: { href?: string; class?: string; children?: Snippet; [key: string]: any } = $props();
</script>

{#if href}
  <a
    {href}
    class={cn('transition-colors hover:text-foreground', className)}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <span class={cn('font-normal text-foreground', className)} {...rest}>
    {@render children?.()}
  </span>
{/if}