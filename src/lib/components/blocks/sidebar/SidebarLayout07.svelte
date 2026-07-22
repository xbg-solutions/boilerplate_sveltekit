<!--
  SidebarLayout07.svelte
  Collapsible tree navigation sidebar with Platform and Projects sections, user avatar footer.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';

  type NavChild = { label: string; href: string; active?: boolean };
  type NavItem = {
    label: string;
    href?: string;
    icon?: string;
    active?: boolean;
    children?: NavChild[];
  };

  let {
    class: className = '',
    platformItems = [],
    projectItems = [],
    breadcrumbs = [],
    logo = 'Documentation',
    version = 'v1.0.1',
    user = { name: 'shadcn', email: 'm@example.com' },
    children
  }: {
    class?: string;
    platformItems?: NavItem[];
    projectItems?: NavItem[];
    breadcrumbs?: Array<{ label: string; href?: string }>;
    logo?: string;
    version?: string;
    user?: { name: string; email: string; avatar?: string };
    children?: Snippet;
  } = $props();

  let openItems = $state<Set<string>>(new Set());

  function toggle(label: string) {
    if (openItems.has(label)) {
      openItems.delete(label);
    } else {
      openItems.add(label);
    }
    openItems = new Set(openItems);
  }
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Sidebar -->
  <aside class="flex w-64 flex-col border-r bg-background">
    <!-- Logo -->
    <div class="flex items-center gap-2 border-b px-4 py-3">
      <span class="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">D</span>
      <span class="font-semibold text-sm">{logo}</span>
      <span class="ml-auto text-xs text-muted-foreground">{version}</span>
      <button type="button" aria-label="Switch workspace" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <!-- Platform section -->
      {#if platformItems.length > 0}
        <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</p>
        <ul class="mb-4 space-y-0.5">
          {#each platformItems as item}
            <li>
              {#if item.children}
                <button
                  type="button"
                  class={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onclick={() => toggle(item.label)}
                >
                  <!-- Lucide icon placeholder -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  <span class="flex-1 text-left">{item.label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cn('transition-transform', openItems.has(item.label) && 'rotate-90')}><path d="m9 18 6-6-6-6"/></svg>
                </button>
                {#if openItems.has(item.label)}
                  <ul class="ml-4 mt-0.5 space-y-0.5 border-l pl-2">
                    {#each item.children as child}
                      <li>
                        <a
                          href={child.href}
                          class={cn(
                            'block rounded-md px-2 py-1.5 text-sm transition-colors',
                            child.active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                          )}
                        >{child.label}</a>
                      </li>
                    {/each}
                  </ul>
                {/if}
              {:else}
                <a
                  href={item.href ?? '#'}
                  class={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  <span class="flex-1">{item.label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      <!-- Projects section -->
      {#if projectItems.length > 0}
        <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projects</p>
        <ul class="space-y-0.5">
          {#each projectItems as item}
            <li>
              <a
                href={item.href ?? '#'}
                class={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
                <span class="flex-1">{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </nav>

    <!-- User Footer -->
    <div class="flex items-center gap-3 border-t px-4 py-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {user.name.slice(0, 2).toUpperCase()}
      </div>
      <div class="flex-1 overflow-hidden">
        <p class="truncate text-sm font-medium">{user.name}</p>
        <p class="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <button type="button" aria-label="Open user menu" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    {#if breadcrumbs.length > 0}
      <div class="flex items-center gap-2 border-b px-6 py-3">
        <button type="button" aria-label="Toggle sidebar" class="text-muted-foreground hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
        </button>
        <Breadcrumb>
          {#each breadcrumbs as crumb, i}
            <BreadcrumbItem>
              {#if crumb.href}
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              {:else}
                <span class="text-sm text-foreground">{crumb.label}</span>
              {/if}
            </BreadcrumbItem>
            {#if i < breadcrumbs.length - 1}
              <BreadcrumbSeparator />
            {/if}
          {/each}
        </Breadcrumb>
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">
      {@render children?.()}
    </div>
  </main>
</div>
