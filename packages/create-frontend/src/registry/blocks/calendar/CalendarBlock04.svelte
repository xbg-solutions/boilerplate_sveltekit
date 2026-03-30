<!--
  CalendarBlock04.svelte
  Single month with continuous date-range row highlight (start–end dates).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    startDate = null,
    endDate = null,
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    startDate?: Date | null;
    endDate?: Date | null;
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

  function toNum(d: Date | null) { return d ? d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate() : null; }
  function dayNum(d: number) { return year * 10000 + month * 100 + d; }

  function inRange(d: number): boolean {
    const n = dayNum(d), s = toNum(startDate), e = toNum(endDate);
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return n >= lo && n <= hi;
  }
  function isStart(d: number): boolean {
    const n = dayNum(d), s = toNum(startDate), e = toNum(endDate);
    if (!s) return false;
    return n === (s <= (e ?? s) ? s : e!);
  }
  function isEnd(d: number): boolean {
    const n = dayNum(d), s = toNum(startDate), e = toNum(endDate);
    if (!e) return false;
    return n === (s <= e ? e : s);
  }

  function handleClick(d: number) {
    const clicked = new Date(year, month, d);
    if (!startDate || (startDate && endDate)) {
      startDate = clicked; endDate = null;
    } else {
      endDate = clicked;
    }
  }

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
          'flex h-8 w-8 items-center justify-center text-sm transition-colors',
          !cur && 'text-muted-foreground/40 pointer-events-none',
          cur && inRange(day) && 'bg-muted',
          cur && (isStart(day) || isEnd(day)) && 'rounded-full bg-primary text-primary-foreground',
          cur && !inRange(day) && 'rounded-full hover:bg-muted'
        )}
        onclick={() => cur && handleClick(day)}
        disabled={!cur}
      >{day}</button>
    {/each}
  </div>
</div>
