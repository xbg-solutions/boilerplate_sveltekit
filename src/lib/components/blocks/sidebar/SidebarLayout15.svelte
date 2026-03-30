<!--
  SidebarLayout15.svelte
  Notion workspace with left sidebar + right calendar panel (mini cal + calendar lists).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Checkbox } from '$lib/components/ui';

  type PageItem = { label: string; href: string; icon?: string; active?: boolean };
  type PageGroup = { title: string; items: PageItem[]; showMore?: boolean };
  type CalList = { label: string; items: Array<{ label: string; checked: boolean }> };

  let {
    class: className = '',
    workspace = 'Acme Inc',
    quickLinks = [],
    groups = [],
    footerLinks = [],
    calendarLists = [],
    breadcrumbs = [],
    children
  }: {
    class?: string;
    workspace?: string;
    quickLinks?: Array<{ label: string; href: string }>;
    groups?: PageGroup[];
    footerLinks?: Array<{ label: string; href: string }>;
    calendarLists?: CalList[];
    breadcrumbs?: Array<{ label: string; href?: string }>;
    children?: Snippet;
  } = $props();

  // Mini calendar
  const today = new Date();
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function getDim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getCalDays(y: number, m: number) {
    const dim = getDim(y, m);
    const fd = new Date(y, m, 1).getDay();
    const prev = getDim(y, m - 1);
    const days: Array<{ day: number; cur: boolean }> = [];
    for (let i = fd - 1; i >= 0; i--) days.push({ day: prev - i, cur: false });
    for (let i = 1; i <= dim; i++) days.push({ day: i, cur: true });
    while (days.length < 42) days.push({ day: days.length - dim - fd + 2, cur: false });
    return days;
  }
  let calDays = $derived(getCalDays(viewYear, viewMonth));
  let selectedDay = $state(today.getDate());
  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }

  let openSections = $state<Set<string>>(new Set(calendarLists.map(l => l.label)));
  function toggleSection(label: string) {
    openSections = openSections.has(label)
      ? new Set([...openSections].filter(s => s !== label))
      : new Set([...openSections, label]);
  }

  // User (placeholder)
  const user = { name: 'shadcn', email: 'm@example.com' };
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Left workspace sidebar -->
  <aside class="flex w-60 flex-col border-r bg-background">
    <div class="flex items-center justify-between border-b px-3 py-3">
      <button type="button" class="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold hover:bg-muted">
        <div class="flex h-5 w-5 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">{workspace.slice(0,1)}</div>
        {workspace}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>

    {#if quickLinks.length > 0}
      <nav class="border-b px-2 py-2">
        <ul class="space-y-0.5">
          {#each quickLinks as link}
            <li>
              <a href={link.href} class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}

    <div class="flex-1 overflow-y-auto px-2 py-2">
      {#each groups as group}
        <div class="mb-3">
          <p class="mb-1 px-2 text-xs font-semibold text-muted-foreground">{group.title}</p>
          <ul class="space-y-0.5">
            {#each group.items as item}
              <li>
                <a href={item.href} class={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors', item.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                  {#if item.icon}<span class="text-base leading-none">{item.icon}</span>
                  {:else}<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
                  {/if}
                  <span class="flex-1 truncate">{item.label}</span>
                  <button type="button" class="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100" onclick={(e) => e.preventDefault()}>
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

    {#if footerLinks.length > 0}
      <nav class="border-t px-2 py-2">
        <ul class="space-y-0.5">
          {#each footerLinks as link}
            <li>
              <a href={link.href} class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
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
        {#each breadcrumbs as crumb, i}
          {#if i > 0}<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>{/if}
          <a href={crumb.href ?? '#'} class={cn('text-sm', i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>{crumb.label}</a>
        {/each}
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">{@render children?.()}</div>
  </main>

  <!-- Right calendar panel -->
  <aside class="flex w-64 flex-col border-l bg-background">
    <!-- User header -->
    <div class="flex items-center justify-between border-b px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">{user.name.slice(0,2).toUpperCase()}</div>
        <div>
          <p class="text-sm font-medium">{user.name}</p>
          <p class="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <button type="button" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </button>
    </div>

    <!-- Mini calendar -->
    <div class="border-b p-3">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" onclick={prev} class="rounded p-1 hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-sm font-medium">{MONTHS_SHORT[viewMonth]} {viewYear}</span>
        <button type="button" onclick={next} class="rounded p-1 hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7">
        {#each DAYS as d}
          <div class="flex h-7 w-7 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
        {/each}
        {#each calDays as { day, cur }}
          <button
            type="button"
            class={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',
              !cur && 'text-muted-foreground/40',
              cur && 'hover:bg-muted',
              cur && day === selectedDay && 'bg-primary text-primary-foreground hover:bg-primary'
            )}
            onclick={() => cur && (selectedDay = day)}
          >{day}</button>
        {/each}
      </div>
    </div>

    <!-- Calendar lists -->
    <nav class="flex-1 overflow-y-auto px-3 py-2">
      {#each calendarLists as list}
        <div class="mb-3">
          <button type="button" class="mb-1 flex w-full items-center justify-between rounded px-1 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground" onclick={() => toggleSection(list.label)}>
            {list.label}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cn('transition-transform', !openSections.has(list.label) && '-rotate-90')}><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {#if openSections.has(list.label)}
            <ul class="space-y-1">
              {#each list.items as item}
                <li class="flex items-center gap-2 px-1">
                  <Checkbox checked={item.checked} />
                  <span class="text-sm">{item.label}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </nav>

    <div class="border-t px-4 py-3">
      <button type="button" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        New Calendar
      </button>
    </div>
  </aside>
</div>
