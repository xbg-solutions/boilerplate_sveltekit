<!--
  AppShell04.svelte
  Doc-style left sidebar (grouped nav + version) + breadcrumb + page title + search + content slot.
  Mirrors SidebarLayout01 pattern on the left.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface SidebarGroup {
    label: string;
    items: Array<{ label: string; href?: string; icon?: string; current?: boolean; children?: Array<{ label: string; href?: string; current?: boolean }> }>;
  }

  let {
    class: className = '',
    sidebarTitle = 'Documentation',
    sidebarVersion = 'v1.0.1',
    sidebarGroups = defaultGroups(),
    breadcrumbs = [{ label: 'Settings', href: '#' }, { label: 'API' }],
    title = 'API Settings',
    searchPlaceholder = 'Search',
    user = { name: 'shadcn', email: 'm@example.com' },
    children
  }: {
    class?: string;
    sidebarTitle?: string;
    sidebarVersion?: string;
    sidebarGroups?: SidebarGroup[];
    breadcrumbs?: Array<{ label: string; href?: string }>;
    title?: string;
    searchPlaceholder?: string;
    user?: { name: string; email: string };
    children?: Snippet;
  } = $props();

  function defaultGroups(): SidebarGroup[] {
    return [
      {
        label: 'Platform',
        items: [
          { label: 'Playground', href: '#', icon: 'layout' },
          { label: 'Models', href: '#', icon: 'cpu', children: [{ label: 'GPT-4', href: '#' }] },
          { label: 'Documentation', href: '#', icon: 'book', children: [{ label: 'API Reference', href: '#', current: true }] },
          { label: 'Settings', href: '#', icon: 'settings', children: [{ label: 'General', href: '#' }, { label: 'Team', href: '#' }, { label: 'API', href: '#', current: true }, { label: 'Limits', href: '#' }] }
        ]
      },
      {
        label: 'Projects',
        items: [
          { label: 'Design Engineering', href: '#', icon: 'grid' },
          { label: 'Sales & Marketing', href: '#', icon: 'clock' },
          { label: 'Travel', href: '#', icon: 'map' }
        ]
      }
    ];
  }

  let expanded = $state<Set<string>>(new Set(['Settings']));
  function toggle(label: string) {
    const s = new Set(expanded);
    s.has(label) ? s.delete(label) : s.add(label);
    expanded = s;
  }

  function iconPath(icon?: string): string {
    switch(icon) {
      case 'layout': return 'M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h4v6';
      case 'cpu': return 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z M7 7h.01';
      case 'book': return 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20';
      case 'settings': return 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
      case 'grid': return 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z';
      case 'clock': return 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l3 3';
      case 'map': return 'M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z M9 4v13 M15 7v13';
      default: return 'M3 12h18 M12 3v18';
    }
  }
</script>

<div class={cn('flex min-h-screen bg-muted/30', className)}>
  <!-- Sidebar -->
  <aside class="hidden w-56 flex-col border-r bg-background md:flex">
    <!-- Header -->
    <div class="flex h-14 items-center justify-between border-b px-4">
      <div class="flex items-center gap-2">
        <div class="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
        </div>
        <div>
          <p class="text-sm font-medium">{sidebarTitle}</p>
          <p class="text-[10px] text-muted-foreground">{sidebarVersion}</p>
        </div>
      </div>
      <button type="button" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto p-2">
      {#each sidebarGroups as group}
        <p class="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
        {#each group.items as item}
          {#if item.children}
            <button
              type="button"
              onclick={() => toggle(item.label)}
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><path d={iconPath(item.icon)}/></svg>
              <span class="flex-1 text-left">{item.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cn('transition-transform', expanded.has(item.label) && 'rotate-180')}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {#if expanded.has(item.label)}
              <div class="ml-5 flex flex-col border-l pl-2">
                {#each item.children as child}
                  <a href={child.href ?? '#'} class={cn('rounded-sm px-2 py-1 text-sm hover:bg-muted', child.current && 'bg-muted font-medium')}>{child.label}</a>
                {/each}
              </div>
            {/if}
          {:else}
            <a href={item.href ?? '#'} class={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted', item.current && 'bg-muted font-medium')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><path d={iconPath(item.icon)}/></svg>
              {item.label}
            </a>
          {/if}
        {/each}
      {/each}
    </nav>

    <!-- User footer -->
    <div class="border-t p-3">
      <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">{user.name[0]?.toUpperCase()}</div>
        <div class="flex-1 text-left">
          <p class="text-xs font-medium">{user.name}</p>
          <p class="text-[10px] text-muted-foreground">{user.email}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  </aside>

  <!-- Main -->
  <div class="flex flex-1 flex-col">
    <div class="flex-1 px-4 py-6 md:px-8">
      <!-- Breadcrumb -->
      <nav class="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        {#each breadcrumbs as crumb, i}
          {#if i > 0}<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>{/if}
          {#if crumb.href && i < breadcrumbs.length - 1}
            <a href={crumb.href} class="hover:text-foreground">{crumb.label}</a>
          {:else}
            <span class={i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}>{crumb.label}</span>
          {/if}
        {/each}
      </nav>

      <!-- Page header -->
      <div class="mb-6 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold">{title}</h1>
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder={searchPlaceholder} class="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-36" />
        </div>
      </div>

      {#if children}
        {@render children()}
      {:else}
        <div class="flex min-h-32 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
          Slot (swap it with your content)
        </div>
      {/if}
    </div>
  </div>
</div>
