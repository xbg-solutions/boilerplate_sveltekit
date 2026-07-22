<!--
  SidebarLayout04.svelte
  Sidebar with tree-style nested/expandable items.
-->
<script module lang="ts">
  /**
   * Recursive tree item structure.
   * Each item can have children for nesting.
   */
  export interface TreeItem {
    label: string;
    href?: string;
    icon?: string;
    active?: boolean;
    children?: TreeItem[];
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import Self from './SidebarLayout04.svelte';
  import { cn } from '$lib/utils/cn';
  import { DynamicIcon } from '$lib/components/ui/icon';

  let {
    class: className = '',
    items = [],
    title = 'Explorer',
    _depth = 0,
    _isNested = false,
    children
  }: {
    class?: string;
    items?: TreeItem[];
    title?: string;
    _depth?: number;
    _isNested?: boolean;
    children?: Snippet;
  } = $props();

  let expandedItems: Record<string, boolean> = $state({});

  function toggleItem(label: string) {
    expandedItems[label] = !expandedItems[label];
  }
</script>

{#if _isNested}
  <!-- Recursive rendering of nested items -->
  <ul class="space-y-0.5">
    {#each items as item}
      <li>
        {#if item.children && item.children.length > 0}
          <button
            type="button"
            class={cn(
              'flex w-full items-center gap-1.5 rounded-md py-1 text-sm transition-colors hover:bg-muted',
              item.active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            style="padding-left: {_depth * 12 + 8}px"
            onclick={() => toggleItem(item.label)}
          >
            <!-- Lucide: ChevronRight / ChevronDown -->
            <span class="flex h-4 w-4 shrink-0 items-center justify-center text-xs">
              {expandedItems[item.label] ? 'v' : '>'}
            </span>
            {#if item.icon}
              <DynamicIcon name={item.icon} size={16} />
            {/if}
            <span class="truncate">{item.label}</span>
          </button>
          {#if expandedItems[item.label]}
            <Self items={item.children} _depth={_depth + 1} _isNested={true} />
          {/if}
        {:else}
          <a
            href={item.href || '#'}
            class={cn(
              'flex items-center gap-1.5 rounded-md py-1 text-sm transition-colors hover:bg-muted',
              item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            style="padding-left: {_depth * 12 + 24}px"
          >
            {#if item.icon}
              <DynamicIcon name={item.icon} size={16} />
            {/if}
            <span class="truncate">{item.label}</span>
          </a>
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <!-- Top-level layout -->
  <div class={cn('flex h-screen', className)}>
    <!-- Sidebar -->
    <aside class="flex w-64 flex-col border-r bg-background">
      <!-- Header -->
      <div class="flex h-14 items-center border-b px-4">
        <span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>

      <!-- Tree Nav -->
      <nav class="flex-1 overflow-y-auto p-3">
        <Self {items} _depth={0} _isNested={true} />
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      {@render children?.()}
    </main>
  </div>
{/if}
