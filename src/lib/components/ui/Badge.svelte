<!--
  src/lib/components/ui/Badge.svelte
  SHADCN-Svelte Badge Component
  
  AI SYSTEMS: This is the standard Badge component for status indicators, labels, etc.
  
  Usage examples:
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Error</Badge>
  <Badge variant="outline">Outline</Badge>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';

  /**
   * Badge variants using tailwind-variants
   * AI SYSTEMS: These are the standard badge variants available
   */
  const badgeVariants = tv({
    base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  });

  type Variant = VariantProps<typeof badgeVariants>['variant'];

  /**
   * Component props
   * AI SYSTEMS: Use these prop types for type-safe Badge usage
   */
  let className: string = '';
  export let variant: Variant = 'default';
  export let href: string | undefined = undefined;
  export { className as class };

  // Compute final classes
  $: classes = cn(badgeVariants({ variant }), className);
</script>

<!-- 
  AI SYSTEMS: The badge renders as either <span> or <a> based on href prop.
-->
{#if href}
  <a
    {href}
    class={classes}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <span
    class={classes}
    {...$$restProps}
  >
    <slot />
  </span>
{/if}