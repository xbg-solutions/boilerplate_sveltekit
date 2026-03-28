<!--
  SidebarLayout02.svelte
  Icon-only sidebar that expands on hover to show labels.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '@xbg.solutions/frontend-core';
  import { Button } from '$lib/components/ui';
  import { DynamicIcon } from '$lib/components/ui/icon';

  let {
    class: className = '',
    items = [],
    children
  }: {
    class?: string;
    items?: Array<{
      icon: string;
      label: string;
      href: string;
      active?: boolean;
    }>;
    children?: Snippet;
  } = $props();

  let expanded = $state(false);
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Sidebar -->
  <aside
    class={cn(
      'flex flex-col border-r bg-background transition-all duration-200',
      expanded ? 'w-48' : 'w-16'
    )}
    onmouseenter={() => (expanded = true)}
    onmouseleave={() => (expanded = false)}
    role="navigation"
  >
    <!-- Logo -->
    <div class="flex h-14 items-center justify-center border-b">
      <!-- Lucide: Command -->
      <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        C
      </span>
    </div>

    <!-- Nav Items -->
    <nav class="flex flex-1 flex-col gap-1 p-2">
      {#each items as item}
        <a
          href={item.href}
          class={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            item.active
              ? 'bg-muted font-medium text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={item.label}
        >
          <!-- Icon -->
          <DynamicIcon name={item.icon} size={20} />
          {#if expanded}
            <span class="truncate">{item.label}</span>
          {/if}
        </a>
      {/each}
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto">
    {@render children?.()}
  </main>
</div>
