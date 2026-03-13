<!--
  src/lib/components/ui/menu/MenuItem.svelte
  Navigation menu item with direction and state variants.

  Usage:
  <MenuItem href="/about" direction="horizontal" state="current">About</MenuItem>
  <MenuItem direction="vertical" showIcon>
    <svelte:fragment slot="icon"><SettingsIcon /></svelte:fragment>
    Settings
  </MenuItem>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';

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

  export let direction: Direction = 'horizontal';
  export let showIcon: boolean = false;
  export let state: State = 'default';
  export let href: string | undefined = undefined;

  let className: string = '';
  export { className as class };

  $: classes = cn(menuItemVariants({ direction, state }), className);
</script>

{#if href}
  <a
    {href}
    class={classes}
    aria-current={state === 'current' ? 'page' : undefined}
    {...$$restProps}
    on:click
  >
    {#if showIcon}
      <slot name="icon" />
    {/if}
    <slot />
  </a>
{:else}
  <button
    type="button"
    class={classes}
    {...$$restProps}
    on:click
  >
    {#if showIcon}
      <slot name="icon" />
    {/if}
    <slot />
  </button>
{/if}
