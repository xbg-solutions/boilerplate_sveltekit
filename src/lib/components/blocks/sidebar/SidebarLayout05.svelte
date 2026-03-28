<!--
  SidebarLayout05.svelte
  Dashboard sidebar with main nav + footer actions (settings, help).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '@xbg.solutions/frontend-core';
  import { DynamicIcon } from '$lib/components/ui/icon';
  import Separator from '$lib/components/ui/Separator.svelte';

  let {
    class: className = '',
    navItems = [],
    footerItems = [],
    title = 'Dashboard',
    children
  }: {
    class?: string;
    navItems?: Array<{
      label: string;
      href: string;
      icon?: string;
      active?: boolean;
      badge?: string;
    }>;
    footerItems?: Array<{
      label: string;
      href: string;
      icon?: string;
    }>;
    title?: string;
    children?: Snippet;
  } = $props();
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Sidebar -->
  <aside class="flex w-64 flex-col border-r bg-background">
    <!-- Header -->
    <div class="flex h-14 items-center gap-2 border-b px-4">
      <!-- Lucide: LayoutDashboard -->
      <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        D
      </span>
      <span class="font-semibold">{title}</span>
    </div>

    <!-- Main Nav -->
    <nav class="flex-1 overflow-y-auto p-3">
      <ul class="space-y-1">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                item.active
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {#if item.icon}
                <DynamicIcon name={item.icon} size={16} />
              {/if}
              <span class="flex-1">{item.label}</span>
              {#if item.badge}
                <span class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {item.badge}
                </span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Footer Actions -->
    {#if footerItems.length > 0}
      <div class="border-t p-3">
        <ul class="space-y-1">
          {#each footerItems as item}
            <li>
              <a
                href={item.href}
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {#if item.icon}
                  <DynamicIcon name={item.icon} size={16} />
                {/if}
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto">
    {@render children?.()}
  </main>
</div>
