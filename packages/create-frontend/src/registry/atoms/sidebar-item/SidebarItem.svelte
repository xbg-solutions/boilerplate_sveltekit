<!--
  src/lib/components/ui/sidebar-item/SidebarItem.svelte
  Sidebar navigation item with icon, text, and optional notification badge.

  Usage:
  <SidebarItem href="/inbox" state="current" notificationCount={5}>
    {#snippet icon()}<InboxIcon />{/snippet}
    Inbox
  </SidebarItem>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  const sidebarItemVariants = tv({
    base: 'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    variants: {
      state: {
        default: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        hover: 'bg-muted text-foreground',
        current: 'bg-muted text-primary'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  });

  type State = VariantProps<typeof sidebarItemVariants>['state'];

  let {
    state = 'default',
    notificationCount = undefined,
    href = undefined,
    class: className = '',
    icon,
    children,
    ...rest
  }: {
    state?: State;
    notificationCount?: number | undefined;
    href?: string | undefined;
    class?: string;
    icon?: Snippet;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  let classes = $derived(cn(sidebarItemVariants({ state }), className));
</script>

{#if href}
  <a
    {href}
    class={classes}
    aria-current={state === 'current' ? 'page' : undefined}
    {...rest}
  >
    <span class="flex-shrink-0 w-4 h-4">
      {@render icon?.()}
    </span>
    <span class="flex-1 truncate">
      {@render children?.()}
    </span>
    {#if notificationCount !== undefined && notificationCount > 0}
      <span class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        {notificationCount}
      </span>
    {/if}
  </a>
{:else}
  <button
    type="button"
    class={classes}
    {...rest}
  >
    <span class="flex-shrink-0 w-4 h-4">
      {@render icon?.()}
    </span>
    <span class="flex-1 truncate text-left">
      {@render children?.()}
    </span>
    {#if notificationCount !== undefined && notificationCount > 0}
      <span class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        {notificationCount}
      </span>
    {/if}
  </button>
{/if}
