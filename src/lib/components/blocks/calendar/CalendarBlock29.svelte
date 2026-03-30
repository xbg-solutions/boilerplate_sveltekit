<!--
  CalendarBlock29.svelte
  "Select your stay" — a dropdown trigger displaying the selected date range,
  with an inline single-month range-picker calendar below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    label = 'Select your stay',
    startDate = null,
    endDate = null
  }: {
    class?: string;
    label?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  } = $props();

  const today = new Date();
  let open = $state(false);
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());

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

  function inRange(d: number) {
    const n = new Date(viewYear, viewMonth, d).getTime();
    const s = startDate?.getTime(), e = endDate?.getTime();
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return n >= lo && n <= hi;
  }
  function isEdge(d: number) {
    const n = new Date(viewYear, viewMonth, d).getTime();
    return n === startDate?.getTime() || n === endDate?.getTime();
  }

  function handleClick(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    if (!startDate || endDate) { startDate = clicked; endDate = null; }
    else { endDate = clicked; open = false; }
  }

  function formatShort(d: Date) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
  }

  function rangeText() {
    if (!startDate) return null;
    if (!endDate) return formatShort(startDate);
    const [a, b] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
    return `${formatShort(a)} – ${formatShort(b)}`;
  }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }
  let calDays = $derived(getCalDays(viewYear, viewMonth));
  let displayText = $derived(rangeText());
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <label class="text-sm font-medium">{label}</label>
  {/if}

  <!-- Trigger dropdown -->
  <button
    type="button"
    onclick={() => (open = !open)}
    class="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted"
  >
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      <span class={displayText ? '' : 'text-muted-foreground'}>{displayText ?? 'Select dates'}</span>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
  </button>

  <!-- Inline calendar (opens below trigger) -->
  {#if open}
    <div class="rounded-md border bg-background p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <button type="button" onclick={prev} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onclick={next} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
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
    </div>
  {/if}
</div>
