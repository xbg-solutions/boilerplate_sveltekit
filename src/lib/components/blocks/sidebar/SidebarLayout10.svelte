<!--
  SidebarLayout10.svelte
  Notion-style workspace sidebar: account header, quick links, grouped pages, footer utilities.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';

  type PageItem = { label: string; href: string; icon?: string; active?: boolean };
  type PageGroup = { title: string; items: PageItem[]; showMore?: boolean };

  let {
    class: className = '',
    workspace = 'Acme Inc',
    quickLinks = [],
    groups = [],
    footerLinks = [],
    breadcrumbs = [],
    children
  }: {
    class?: string;
    workspace?: string;
    quickLinks?: Array<{ label: string; href: string; icon: string }>;
    groups?: PageGroup[];
    footerLinks?: Array<{ label: string; href: string; icon: string }>;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    children?: Snippet;
  } = $props();

  const ICON_MAP: Record<string, string> = {
    search: 'M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z',
    ai: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4l3 3',
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    calendar: 'M8 2v4 M16 2v4 M3 10h18 M21 8H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z',
    settings: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    trash: 'M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
    template: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18',
    help: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01',
  };

  function getIconPath(icon: string): string {
    return ICON_MAP[icon] ?? 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z';
  }
</script>

<div class={cn('flex h-screen', className)}>
  <aside class="flex w-60 flex-col border-r bg-background">
    <!-- Workspace header -->
    <div class="flex items-center justify-between border-b px-3 py-3">
      <button type="button" class="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold hover:bg-muted">
        <div class="flex h-5 w-5 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
          {workspace.slice(0, 1)}
        </div>
        {workspace}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>

    <!-- Quick links -->
    {#if quickLinks.length > 0}
      <nav class="border-b px-2 py-2">
        <ul class="space-y-0.5">
          {#each quickLinks as link}
            <li>
              <a href={link.href} class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d={getIconPath(link.icon)} />
                </svg>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}

    <!-- Page groups -->
    <div class="flex-1 overflow-y-auto px-2 py-2">
      {#each groups as group}
        <div class="mb-3">
          <p class="mb-1 px-2 text-xs font-semibold text-muted-foreground">{group.title}</p>
          <ul class="space-y-0.5">
            {#each group.items as item}
              <li>
                <a
                  href={item.href}
                  class={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {#if item.icon}
                    <span class="text-base leading-none">{item.icon}</span>
                  {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
                  {/if}
                  <span class="flex-1 truncate">{item.label}</span>
                  <button type="button" class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground" onclick={(e) => e.preventDefault()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                </a>
              </li>
            {/each}
            {#if group.showMore}
              <li>
                <button type="button" class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  More
                </button>
              </li>
            {/if}
          </ul>
        </div>
      {/each}
    </div>

    <!-- Footer utilities -->
    {#if footerLinks.length > 0}
      <nav class="border-t px-2 py-2">
        <ul class="space-y-0.5">
          {#each footerLinks as link}
            <li>
              <a href={link.href} class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d={getIconPath(link.icon)} />
                </svg>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </aside>

  <!-- Main content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    {#if breadcrumbs.length > 0}
      <div class="flex items-center gap-2 border-b px-6 py-3">
        <button type="button" class="text-muted-foreground hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
        </button>
        <Breadcrumb>
          {#each breadcrumbs as crumb, i}
            <BreadcrumbItem>
              {#if crumb.href}<BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              {:else}<span class="text-sm text-foreground">{crumb.label}</span>
              {/if}
            </BreadcrumbItem>
            {#if i < breadcrumbs.length - 1}<BreadcrumbSeparator />{/if}
          {/each}
        </Breadcrumb>
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">{@render children?.()}</div>
  </main>
</div>
