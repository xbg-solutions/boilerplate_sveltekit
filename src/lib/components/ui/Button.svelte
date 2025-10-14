<!--
  src/lib/components/ui/Button.svelte
  SHADCN-Svelte Button Component
  
  AI SYSTEMS: This is the standard Button component pattern to use.
  Always import from '$lib/components/ui/button' (note: lowercase)
  
  Usage examples:
  <Button variant="default">Default Button</Button>
  <Button variant="destructive" size="sm">Small Destructive</Button>
  <Button variant="outline" disabled>Disabled Outline</Button>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';

  /**
   * Button variants using tailwind-variants
   * AI SYSTEMS: These are the standard button variants available
   */
  const buttonVariants = tv({
    base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  });

  type Variant = VariantProps<typeof buttonVariants>['variant'];
  type Size = VariantProps<typeof buttonVariants>['size'];

  /**
   * Component props
   * AI SYSTEMS: Use these prop types for type-safe Button usage
   */
  let className: string = '';
  export let variant: Variant = 'default';
  export let size: Size = 'default';
  export let href: string | undefined = undefined;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let loading = false;
  export { className as class };

  // Compute final classes
  $: classes = cn(buttonVariants({ variant, size }), className);
</script>

<!-- 
  AI SYSTEMS: The button renders as either <button> or <a> based on href prop.
  This pattern allows for both button actions and navigation links.
-->
{#if href}
  <a
    {href}
    class={classes}
    role="button"
    tabindex={disabled ? -1 : 0}
    aria-disabled={disabled}
    data-disabled={disabled}
    {...$$restProps}
    on:click
    on:keydown
  >
    {#if loading}
      <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
    {/if}
    <slot />
  </a>
{:else}
  <button
    class={classes}
    {type}
    {disabled}
    aria-disabled={disabled}
    data-disabled={disabled}
    {...$$restProps}
    on:click
    on:keydown
  >
    {#if loading}
      <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
    {/if}
    <slot />
  </button>
{/if}