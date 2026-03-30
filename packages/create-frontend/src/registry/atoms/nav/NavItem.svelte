<!--
  src/lib/components/ui/nav/NavItem.svelte
  Icon-based navigation item with states.

  Usage:
  <NavItem state="current" href="/dashboard">
    {#snippet icon()}<HomeIcon />{/snippet}
  </NavItem>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  const navItemVariants = tv({
    base: 'inline-flex items-center justify-center h-8 w-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    variants: {
      state: {
        default: 'rounded-lg bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        hover: 'rounded-lg bg-accent text-accent-foreground',
        current: 'rounded-full bg-primary text-primary-foreground',
        focused: 'rounded-lg bg-accent text-accent-foreground ring-2 ring-ring ring-offset-2'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  });

  type State = VariantProps<typeof navItemVariants>['state'];

  let {
    state = 'default',
    href = undefined,
    class: className = '',
    icon,
    ...rest
  }: {
    state?: State;
    href?: string | undefined;
    class?: string;
    icon?: Snippet;
    [key: string]: unknown;
  } = $props();

  let classes = $derived(cn(navItemVariants({ state }), className));
</script>

{#if href}
  <a
    {href}
    class={classes}
    aria-current={state === 'current' ? 'page' : undefined}
    {...rest}
  >
    {@render icon?.()}
  </a>
{:else}
  <button
    type="button"
    class={classes}
    aria-current={state === 'current' ? 'page' : undefined}
    {...rest}
  >
    {@render icon?.()}
  </button>
{/if}
