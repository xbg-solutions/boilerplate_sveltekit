<!--
  CalendarBlock23.svelte
  Date + Time picker — labeled Date input with calendar icon and labeled Time input,
  with an inline single-month calendar below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    selectedDate = null,
    selectedTime = '',
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    selectedDate?: Date | null;
    selectedTime?: string;
    month?: number;
    year?: number;
  } = $props();

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
</script>

<div class={cn('inline-flex flex-col gap-4 rounded-md border p-4', className)}>
  <!-- Date + Time inputs row -->
  <div class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-muted-foreground">Date</label>
      <div class="flex items-center gap-2 rounded-md border px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <span class={cn('text-sm', !selectedDate && 'text-muted-foreground')}>{selectedDate ? formatDate(selectedDate) : 'MM/DD/YYYY'}</span>
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-muted-foreground">Time</label>
      <div class="flex items-center gap-2 rounded-md border px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <input
          type="time"
          bind:value={selectedTime}
          class="w-full bg-transparent text-sm outline-none"
          placeholder="HH:MM"
        />
      </div>
    </div>
  </div>

  <!-- Month navigator -->
  <div class="flex items-center justify-between">
    <button type="button" onclick={prev} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <select bind:value={month} class="rounded border bg-background px-2 py-1 text-sm font-medium">
      {#each ['January','February','March','April','May','June','July','August','September','October','November','December'] as m, i}
        <option value={i}>{m}</option>
      {/each}
    </select>
    <select bind:value={year} class="rounded border bg-background px-2 py-1 text-sm font-medium">
      {#each Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 5 + i) as y}
        <option value={y}>{y}</option>
      {/each}
    </select>
    <button type="button" onclick={next} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>

  <!-- Calendar grid -->
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
        onclick={() => cur && (selectedDate = new Date(year, month, day))}
        disabled={!cur}
      >{day}</button>
    {/each}
  </div>
</div>
