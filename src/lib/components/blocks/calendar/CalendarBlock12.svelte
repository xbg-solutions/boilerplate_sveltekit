<!--
  CalendarBlock12.svelte
  "Book an appointment" card — title, subtitle, language dropdown, dual-month range picker.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    title = 'Book an appointment',
    subtitle = 'Select the dates for your appointment',
    language = 'English',
    startDate = null,
    endDate = null
  }: {
    class?: string;
    title?: string;
    subtitle?: string;
    language?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  } = $props();

  const today = new Date();
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
    else endDate = clicked;
  }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }

  let m2 = $derived(viewMonth === 11 ? 0 : viewMonth + 1);
  let y2 = $derived(viewMonth === 11 ? viewYear + 1 : viewYear);
  let left = $derived(getCalDays(viewYear, viewMonth));
  let right = $derived(getCalDays(y2, m2));
</script>

<div class={cn('rounded-xl border bg-background p-6 shadow-sm', className)}>
  <!-- Card header -->
  <div class="mb-6 flex items-start justify-between">
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      <p class="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <!-- Language selector -->
    <button type="button" class="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      {language}
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  </div>

  <!-- Calendar nav -->
  <div class="mb-4 flex items-center justify-between">
    <button type="button" onclick={prev} aria-label="Previous month" class="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span class="text-sm font-medium">{MONTHS[viewMonth]} {viewYear} – {MONTHS[m2]} {y2}</span>
    <button type="button" onclick={next} aria-label="Next month" class="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>

  <!-- Dual month grid -->
  <div class="flex gap-8">
    {#each [[viewYear,viewMonth,left],[y2,m2,right]] as [y,m,days]}
      <div class="flex-1">
        <h3 class="mb-3 text-center text-sm font-medium">{MONTHS[m as number]} {y}</h3>
        <div class="grid grid-cols-7">
          {#each DAYS as d}
            <div class="flex h-9 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
          {/each}
          {#each (days as Array<{day:number;cur:boolean}>) as { day, cur }}
            <button
              type="button"
              class={cn(
                'flex h-9 items-center justify-center text-sm transition-colors',
                !cur && 'text-muted-foreground/40 pointer-events-none',
                cur && inRange(y as number,m as number,day) && !isEdge(y as number,m as number,day) && 'bg-muted',
                cur && isEdge(y as number,m as number,day) && 'rounded-full bg-primary font-medium text-primary-foreground',
                cur && !inRange(y as number,m as number,day) && 'rounded-full hover:bg-muted'
              )}
              onclick={() => cur && handleClick(y as number, m as number, day)}
              disabled={!cur}
            >{day}</button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
