<!--
  CalendarBlock26.svelte
  "Web Analytics" card with a bar chart and a date-range picker button trigger that
  opens a dual-month calendar popover.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    title = 'Web Analytics',
    startDate = null,
    endDate = null,
    chartData = [
      { label: 'Jan', value: 40 },
      { label: 'Feb', value: 65 },
      { label: 'Mar', value: 50 },
      { label: 'Apr', value: 80 },
      { label: 'May', value: 55 },
      { label: 'Jun', value: 90 },
      { label: 'Jul', value: 70 },
      { label: 'Aug', value: 45 },
      { label: 'Sep', value: 75 },
      { label: 'Oct', value: 60 },
      { label: 'Nov', value: 85 },
      { label: 'Dec', value: 95 }
    ]
  }: {
    class?: string;
    title?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    chartData?: Array<{ label: string; value: number }>;
  } = $props();

  const today = new Date();
  let open = $state(false);
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const maxValue = $derived(Math.max(...chartData.map(d => d.value)));

  function getDim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getCalDays(y: number, m: number) {
    const dim = getDim(y, m), fd = new Date(y, m, 1).getDay(), prev = getDim(y, m - 1);
    const days: Array<{ day: number; cur: boolean }> = [];
    for (let i = fd - 1; i >= 0; i--) days.push({ day: prev - i, cur: false });
    for (let i = 1; i <= dim; i++) days.push({ day: i, cur: true });
    while (days.length < 42) days.push({ day: days.length - dim - fd + 2, cur: false });
    return days;
  }

  function inRange(y: number, m: number, d: number) {
    const n = new Date(y, m, d).getTime(), s = startDate?.getTime(), e = endDate?.getTime();
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return n >= lo && n <= hi;
  }
  function isEdge(y: number, m: number, d: number) {
    const n = new Date(y, m, d).getTime();
    return n === startDate?.getTime() || n === endDate?.getTime();
  }

  function handleClick(y: number, m: number, d: number) {
    const clicked = new Date(y, m, d);
    if (!startDate || endDate) { startDate = clicked; endDate = null; }
    else { endDate = clicked; open = false; }
  }

  function formatShort(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function rangeLabel() {
    if (!startDate) return 'Select date range';
    if (!endDate) return formatShort(startDate);
    const [a, b] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
    return `${formatShort(a)} – ${formatShort(b)}`;
  }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }

  let m2 = $derived(viewMonth === 11 ? 0 : viewMonth + 1);
  let y2 = $derived(viewMonth === 11 ? viewYear + 1 : viewYear);
  let leftDays = $derived(getCalDays(viewYear, viewMonth));
  let rightDays = $derived(getCalDays(y2, m2));
</script>

<div class={cn('flex flex-col gap-4 rounded-xl border bg-background p-5 shadow-sm', className)}>
  <!-- Card header -->
  <div class="flex items-center justify-between">
    <h2 class="text-base font-semibold">{title}</h2>
    <!-- Date range button -->
    <div class="relative">
      <button
        type="button"
        onclick={() => (open = !open)}
        class="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        {rangeLabel()}
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {#if open}
        <div class="absolute right-0 top-full z-20 mt-1 rounded-md border bg-background p-4 shadow-lg">
          <div class="mb-3 flex items-center justify-between">
            <button type="button" onclick={prev} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="text-xs font-medium">{MONTHS[viewMonth]} {viewYear} – {MONTHS[m2]} {y2}</span>
            <button type="button" onclick={next} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div class="flex gap-6">
            {#each [[viewYear,viewMonth,leftDays],[y2,m2,rightDays]] as [y,m,days]}
              <div>
                <h3 class="mb-1 text-center text-xs font-medium text-muted-foreground">{MONTHS[m as number]} {y}</h3>
                <div class="grid grid-cols-7">
                  {#each DAYS as d}
                    <div class="flex h-7 w-7 items-center justify-center text-[10px] font-medium text-muted-foreground">{d}</div>
                  {/each}
                  {#each (days as Array<{day:number;cur:boolean}>) as { day, cur }}
                    <button
                      type="button"
                      class={cn(
                        'flex h-7 w-7 items-center justify-center text-xs transition-colors',
                        !cur && 'text-muted-foreground/40 pointer-events-none',
                        cur && inRange(y as number,m as number,day) && !isEdge(y as number,m as number,day) && 'bg-muted',
                        cur && isEdge(y as number,m as number,day) && 'rounded-full bg-primary text-primary-foreground',
                        cur && !inRange(y as number,m as number,day) && 'rounded-full hover:bg-muted'
                      )}
                      onclick={() => cur && handleClick(y as number,m as number,day)}
                      disabled={!cur}
                    >{day}</button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Bar chart -->
  <div class="flex items-end gap-1" style="height: 80px">
    {#each chartData as { label, value }}
      <div class="flex flex-1 flex-col items-center gap-1">
        <div
          class="w-full rounded-sm bg-primary/80 transition-all hover:bg-primary"
          style="height: {(value / maxValue) * 64}px"
        ></div>
        <span class="text-[9px] text-muted-foreground">{label}</span>
      </div>
    {/each}
  </div>
</div>
