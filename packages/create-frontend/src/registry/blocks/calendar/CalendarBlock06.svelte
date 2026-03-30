<!--
  CalendarBlock06.svelte
  Single-month range picker with minimum-days validation message.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    startDate = null,
    endDate = null,
    minDays = 5,
    validationMessage = `A minimum of ${5} days is required`,
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    minDays?: number;
    validationMessage?: string;
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

  function makeTs(y: number, m: number, d: number) { return new Date(y, m, d).getTime(); }
  function inRange(d: number) {
    const n = makeTs(year, month, d), s = startDate?.getTime(), e = endDate?.getTime();
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return n >= lo && n <= hi;
  }
  function isEdge(d: number) {
    const n = makeTs(year, month, d);
    return n === startDate?.getTime() || n === endDate?.getTime();
  }

  function handleClick(d: number) {
    const clicked = new Date(year, month, d);
    if (!startDate || endDate) { startDate = clicked; endDate = null; }
    else endDate = clicked;
  }

  let rangedays = $derived(() => {
    if (!startDate || !endDate) return 0;
    return Math.round(Math.abs(endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  });

  let showError = $derived(endDate !== null && rangedays() < minDays);

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
          cur && inRange(day) && !isEdge(day) && 'bg-muted',
          cur && isEdge(day) && 'rounded-full bg-primary text-primary-foreground',
          cur && !inRange(day) && 'rounded-full hover:bg-muted'
        )}
        onclick={() => cur && handleClick(day)}
        disabled={!cur}
      >{day}</button>
    {/each}
  </div>
  {#if showError}
    <p class="mt-3 text-center text-xs text-muted-foreground">{validationMessage}</p>
  {/if}
</div>
