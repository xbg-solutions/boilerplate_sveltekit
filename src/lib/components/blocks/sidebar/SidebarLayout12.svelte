<!--
  SidebarLayout12.svelte
  Calendar app sidebar: user header, mini calendar, calendar lists with checkboxes.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Checkbox } from '$lib/components/ui';

  type CalendarList = {
    label: string;
    items: Array<{ label: string; checked: boolean; color?: string }>;
    collapsible?: boolean;
  };

  let {
    class: className = '',
    user = { name: 'shadcn', email: 'm@example.com' },
    calendarLists = [],
    contentTitle = '',
    children
  }: {
    class?: string;
    user?: { name: string; email: string };
    calendarLists?: CalendarList[];
    contentTitle?: string;
    children?: Snippet;
  } = $props();

  const today = new Date();
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  function getCalDays(y: number, m: number) {
    const dim = getDaysInMonth(y, m);
    const fd = getFirstDay(y, m);
    const prev = getDaysInMonth(y, m - 1);
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

  // svelte-ignore state_referenced_locally
  let openSections = $state<Set<string>>(new Set(calendarLists.map(l => l.label)));

  function toggleSection(label: string) {
    openSections = openSections.has(label)
      ? new Set([...openSections].filter(s => s !== label))
      : new Set([...openSections, label]);
  }
</script>

<div class={cn('flex h-screen', className)}>
  <aside class="flex w-64 flex-col border-r bg-background">
    <!-- User header -->
    <div class="flex items-center justify-between border-b px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p class="text-sm font-medium">{user.name}</p>
          <p class="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <button type="button" aria-label="User menu" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </button>
    </div>

    <!-- Mini calendar -->
    <div class="border-b p-3">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" onclick={prev} aria-label="Previous month" class="rounded p-1 hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-sm font-medium">{MONTHS_SHORT[viewMonth]} {viewYear}</span>
        <button type="button" onclick={next} aria-label="Next month" class="rounded p-1 hover:bg-muted">
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
            class={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',
              !cur && 'text-muted-foreground/40',
              cur && 'hover:bg-muted',
              cur && day === selectedDay && viewYear === today.getFullYear() && viewMonth === today.getMonth() && 'bg-primary text-primary-foreground hover:bg-primary'
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
          <button
            type="button"
            class="mb-1 flex w-full items-center justify-between rounded px-1 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            onclick={() => toggleSection(list.label)}
          >
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

    <!-- New Calendar -->
    <div class="border-t px-4 py-3">
      <button type="button" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        New Calendar
      </button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    {#if contentTitle}
      <div class="border-b px-6 py-4">
        <h1 class="text-xl font-semibold">{contentTitle}</h1>
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">{@render children?.()}</div>
  </main>
</div>
