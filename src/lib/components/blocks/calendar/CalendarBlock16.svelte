<!--
  CalendarBlock16.svelte
  Single month calendar with Start Time and End Time inputs below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    selectedDate = null,
    startTime = '10:30',
    endTime = '10:30',
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    selectedDate?: Date | null;
    startTime?: string;
    endTime?: string;
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

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <div class="mb-4 flex items-center justify-between">
    <Button variant="ghost" size="sm" onclick={prev}>&lt;</Button>
    <h3 class="text-sm font-medium">{MONTHS[month]} {year}</h3>
    <Button variant="ghost" size="sm" onclick={next}>&gt;</Button>
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
        onclick={() => cur && (selectedDate = new Date(year, month, day))}
        disabled={!cur}
      >{day}</button>
    {/each}
  </div>

  <!-- Time inputs -->
  <div class="mt-4 grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1">
      <label for="calendar16-start-time" class="text-xs font-medium text-muted-foreground">Start Time</label>
      <div class="flex items-center gap-1.5 rounded-md border px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <input
          id="calendar16-start-time"
          type="time"
          bind:value={startTime}
          class="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <label for="calendar16-end-time" class="text-xs font-medium text-muted-foreground">End Time</label>
      <div class="flex items-center gap-1.5 rounded-md border px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <input
          id="calendar16-end-time"
          type="time"
          bind:value={endTime}
          class="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  </div>
</div>
