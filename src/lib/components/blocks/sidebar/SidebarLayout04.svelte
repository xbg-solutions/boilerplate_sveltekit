<!--
  SidebarLayout04.svelte
  Sidebar with tree-style nested/expandable items.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { DynamicIcon } from '$lib/components/ui/icon';

  let className: string = '';
  export { className as class };

  /**
   * Recursive tree item structure.
   * Each item can have children for nesting.
   */
  interface TreeItem {
    label: string;
    href?: string;
    icon?: string;
    active?: boolean;
    children?: TreeItem[];
  }

  export let items: TreeItem[] = [];
  export let title: string = 'Explorer';

  /** Internal: depth level for indentation (used by recursive self) */
  export let _depth: number = 0;
  /** Internal: flag for recursive rendering */
  export let _isNested: boolean = false;

  let expandedItems: Record<string, boolean> = {};

  function toggleItem(label: string) {
    expandedItems[label] = !expandedItems[label];
    expandedItems = expandedItems;
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
            on:click={() => toggleItem(item.label)}
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
            <svelte:self items={item.children} _depth={_depth + 1} _isNested={true} />
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
        <svelte:self {items} _depth={0} _isNested={true} />
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
{/if}
