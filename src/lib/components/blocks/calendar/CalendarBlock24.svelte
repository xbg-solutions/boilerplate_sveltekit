<!--
  CalendarBlock24.svelte
  Calendar with a "Date: Select a date" dropdown trigger and From/To time range inputs below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    selectedDate = null,
    fromTime = '',
    toTime = '',
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    selectedDate?: Date | null;
    fromTime?: string;
    toTime?: string;
    month?: number;
    year?: number;
  } = $props();

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let calendarOpen = $state(true);

  function getDim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getCalDays(y: number, m: number) {
    const dim = getDim(y, m), fd = new Date(y, m, 1).getDay(), prev = getDim(y, m - 1);
    const days: Array<{ day: number; cur: boolean }> = [];
    for (let i = fd - 1; i >= 0; i--) days.push({ day: prev - i, cur: false });
    for (let i = 1; i <= dim; i++) days.push({ day: i, cur: true });
    while (days.length < 42) days.push({ day: days.length - dim - fd + 2, cur: false });
    return days;
  }

  function isSelected(d: number) { return selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === d; }
  function isToday(d: number) { const t = new Date(); return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d; }

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
</script>

<div class={cn('inline-flex flex-col gap-3 rounded-md border p-4', className)}>
  <!-- Date dropdown trigger -->
  <div class="flex flex-col gap-1">
    <span class="text-xs font-medium text-muted-foreground">Date</span>
    <button
      type="button"
      onclick={() => (calendarOpen = !calendarOpen)}
      class="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted"
    >
      <span class={selectedDate ? '' : 'text-muted-foreground'}>{selectedDate ? formatDate(selectedDate) : 'Select a date'}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  </div>

  <!-- Calendar (always inline, toggled) -->
  {#if calendarOpen}
    <div class="rounded-md border p-3">
      <div class="mb-3 flex items-center justify-between">
        <button type="button" onclick={prev} aria-label="Previous month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-sm font-medium">{MONTHS[month]} {year}</span>
        <button type="button" onclick={next} aria-label="Next month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7">
        {#each DAYS as d}
          <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
        {/each}
        {#each calDays as { day, cur }}
          <button
            type="button"
            class={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
              !cur && 'text-muted-foreground/40 pointer-events-none',
              cur && 'hover:bg-muted',
              cur && isToday(day) && !isSelected(day) && 'border border-primary text-primary',
              cur && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
            )}
            onclick={() => { if (cur) { selectedDate = new Date(year, month, day); calendarOpen = false; } }}
            disabled={!cur}
          >{day}</button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- From / To time inputs -->
  <div class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1">
      <label for="cal24-from-time" class="text-xs font-medium text-muted-foreground">From</label>
      <div class="flex items-center gap-1.5 rounded-md border px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <input id="cal24-from-time" type="time" bind:value={fromTime} class="w-full bg-transparent text-sm outline-none" />
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <label for="cal24-to-time" class="text-xs font-medium text-muted-foreground">To</label>
      <div class="flex items-center gap-1.5 rounded-md border px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <input id="cal24-to-time" type="time" bind:value={toTime} class="w-full bg-transparent text-sm outline-none" />
      </div>
    </div>
  </div>
</div>
