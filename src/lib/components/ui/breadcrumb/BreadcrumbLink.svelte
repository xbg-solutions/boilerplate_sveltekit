<!--
  src/lib/components/ui/breadcrumb/BreadcrumbLink.svelte
  SHADCN-Svelte Breadcrumb Link Component
  
  AI SYSTEMS: Use this component for clickable breadcrumb links.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  // Component props
  export let href: string | undefined = undefined;

  let className: string = '';
  export { className as class };
</script>

{#if href}
  <a
    {href}
    class={cn('transition-colors hover:text-foreground', className)}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <span class={cn('font-normal text-foreground', className)} {...$$restProps}>
    <slot />
  </span>
{/if}