<!--
  CalendarBlock15.svelte
  Single month with ISO week numbers shown in a left column.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    selectedDate = null,
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    selectedDate?: Date | null;
    month?: number;
    year?: number;
  } = $props();

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  function getDim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getCalRows(y: number, m: number) {
    const dim = getDim(y, m), fd = new Date(y, m, 1).getDay(), prev = getDim(y, m - 1);
    const days: Array<{ day: number; cur: boolean; date: Date }> = [];
    for (let i = fd - 1; i >= 0; i--) {
      const d = new Date(y, m - 1, prev - i);
      days.push({ day: prev - i, cur: false, date: d });
    }
    for (let i = 1; i <= dim; i++) days.push({ day: i, cur: true, date: new Date(y, m, i) });
    while (days.length < 42) {
      const extra = days.length - dim - fd + 1;
      days.push({ day: extra, cur: false, date: new Date(y, m + 1, extra) });
    }
    // Split into weeks
    const rows: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }

  function isSelected(d: number) { return selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === d; }
  function isToday(d: number) { const t = new Date(); return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d; }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let rows = $derived(getCalRows(year, month));
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <div class="mb-4 flex items-center justify-between">
    <Button variant="ghost" size="sm" onclick={prev}>&lt;</Button>
    <h3 class="text-sm font-medium">{MONTHS[month]} {year}</h3>
    <Button variant="ghost" size="sm" onclick={next}>&gt;</Button>
  </div>

  <!-- Header row: week# + days -->
  <div class="grid grid-cols-8">
    <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground/50"></div>
    {#each DAYS as d}
      <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
    {/each}
  </div>

  <!-- Week rows -->
  {#each rows as week}
    <div class="grid grid-cols-8">
      <!-- Week number -->
      <div class="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground/50">
        {getWeekNumber(week[0].date)}
      </div>
      {#each week as { day, cur }}
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
  {/each}
</div>
