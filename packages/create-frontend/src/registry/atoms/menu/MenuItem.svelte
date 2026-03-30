<!--
  src/lib/components/ui/menu/MenuItem.svelte
  Navigation menu item with direction and state variants.

  Usage:
  <MenuItem href="/about" direction="horizontal" state="current">About</MenuItem>
  <MenuItem direction="vertical" showIcon>
    {#snippet icon()}<SettingsIcon />{/snippet}
    Settings
  </MenuItem>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  const menuItemVariants = tv({
    base: 'inline-flex items-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    variants: {
      direction: {
        horizontal: 'text-sm',
        vertical: 'text-lg'
      },
      state: {
        default: 'text-muted-foreground hover:text-foreground',
        hover: 'text-foreground',
        current: 'text-foreground'
      }
    },
    defaultVariants: {
      direction: 'horizontal',
      state: 'default'
    }
  });

  type Direction = VariantProps<typeof menuItemVariants>['direction'];
  type State = VariantProps<typeof menuItemVariants>['state'];

  let {
    direction = 'horizontal',
    showIcon = false,
    state = 'default',
    href = undefined,
    class: className = '',
    icon,
    children,
    ...rest
  }: {
    direction?: Direction;
    showIcon?: boolean;
    state?: State;
    href?: string | undefined;
    class?: string;
    icon?: Snippet;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  let classes = $derived(cn(menuItemVariants({ direction, state }), className));
</script>

{#if href}
  <a
    {href}
    class={classes}
    aria-current={state === 'current' ? 'page' : undefined}
    {...rest}
  >
    {#if showIcon}
      {@render icon?.()}
    {/if}
    {@render children?.()}
  </a>
{:else}
  <button
    type="button"
    class={classes}
    {...rest}
  >
    {#if showIcon}
      {@render icon?.()}
    {/if}
    {@render children?.()}
  </button>
{/if}
