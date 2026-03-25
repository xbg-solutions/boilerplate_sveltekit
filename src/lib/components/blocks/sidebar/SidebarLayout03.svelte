<!--
  SidebarLayout03.svelte
  Full sidebar with collapsible groups and user avatar at bottom.
-->
<script lang="ts">
  import { cn } from '@xbg.solutions/frontend-core';
  import { Button, Avatar } from '$lib/components/ui';
  import { DynamicIcon } from '$lib/components/ui/icon';
  import Separator from '$lib/components/ui/Separator.svelte';

  let className: string = '';
  export { className as class };

  export let groups: Array<{
    title: string;
    items: Array<{ label: string; href: string; icon?: string; active?: boolean }>;
  }> = [];

  export let user: {
    name: string;
    email: string;
    avatar?: string;
  } | undefined = undefined;

  let collapsedGroups: Record<string, boolean> = {};

  function toggleGroup(title: string) {
    collapsedGroups[title] = !collapsedGroups[title];
    collapsedGroups = collapsedGroups;
  }
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Sidebar -->
  <aside class="flex w-64 flex-col border-r bg-background">
    <!-- Header -->
    <div class="flex h-14 items-center gap-2 border-b px-4">
      <!-- Lucide: Layers -->
      <span class="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground">A</span>
      <span class="font-semibold">Application</span>
    </div>

    <!-- Collapsible Groups -->
    <nav class="flex-1 overflow-y-auto p-3">
      {#each groups as group}
        <div class="mb-2">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            on:click={() => toggleGroup(group.title)}
          >
            {group.title}
            <!-- Lucide: ChevronDown / ChevronRight -->
            <span class="text-xs">
              {collapsedGroups[group.title] ? '>' : 'v'}
            </span>
          </button>
          {#if !collapsedGroups[group.title]}
            <ul class="mt-1 space-y-0.5">
              {#each group.items as item}
                <li>
                  <a
                    href={item.href}
                    class={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      item.active
                        ? 'bg-muted font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {#if item.icon}
                      <DynamicIcon name={item.icon} size={16} />
                    {/if}
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </nav>

    <!-- User Section -->
    {#if user}
      <div class="border-t p-3">
        <Separator class="mb-3" />
        <div class="flex items-center gap-3 rounded-md px-2 py-1.5">
          <Avatar src={user.avatar} alt={user.name} class="h-8 w-8" />
          <div class="flex-1 overflow-hidden">
            <p class="truncate text-sm font-medium">{user.name}</p>
            <p class="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    {/if}
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto">
    <slot />
  </main>
</div>
