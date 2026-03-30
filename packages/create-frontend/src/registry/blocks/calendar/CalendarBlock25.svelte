<!--
  CalendarBlock25.svelte
  Check-in / Check-out booking card — date+time dropdowns for each,
  plus a dual-month range picker calendar.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    checkInDate = null,
    checkOutDate = null,
    checkInTime = '14:00',
    checkOutTime = '11:00'
  }: {
    class?: string;
    checkInDate?: Date | null;
    checkOutDate?: Date | null;
    checkInTime?: string;
    checkOutTime?: string;
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
    const n = new Date(y, m, d).getTime();
    const s = checkInDate?.getTime(), e = checkOutDate?.getTime();
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return n >= lo && n <= hi;
  }
  function isEdge(y: number, m: number, d: number) {
    const n = new Date(y, m, d).getTime();
    return n === checkInDate?.getTime() || n === checkOutDate?.getTime();
  }

  function handleDayClick(y: number, m: number, d: number) {
    const clicked = new Date(y, m, d);
    if (!checkInDate || checkOutDate) { checkInDate = clicked; checkOutDate = null; }
    else checkOutDate = clicked;
  }

  function formatDate(d: Date | null) {
    if (!d) return 'Select';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }

  let m2 = $derived(viewMonth === 11 ? 0 : viewMonth + 1);
  let y2 = $derived(viewMonth === 11 ? viewYear + 1 : viewYear);
  let leftDays = $derived(getCalDays(viewYear, viewMonth));
  let rightDays = $derived(getCalDays(y2, m2));
</script>

<div class={cn('inline-flex flex-col gap-4 rounded-xl border bg-background p-5', className)}>
  <!-- Check-in / Check-out rows -->
  <div class="grid grid-cols-2 gap-4">
    <!-- Check-in -->
    <div class="flex flex-col gap-2 rounded-lg border p-3">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-in</span>
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <span class={checkInDate ? '' : 'text-muted-foreground'}>{formatDate(checkInDate)}</span>
        </div>
        <div class="flex items-center gap-2 rounded-md border px-2 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <input type="time" bind:value={checkInTime} class="w-full bg-transparent text-sm outline-none" />
        </div>
      </div>
    </div>
    <!-- Check-out -->
    <div class="flex flex-col gap-2 rounded-lg border p-3">
      <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-out</span>
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <span class={checkOutDate ? '' : 'text-muted-foreground'}>{formatDate(checkOutDate)}</span>
        </div>
        <div class="flex items-center gap-2 rounded-md border px-2 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <input type="time" bind:value={checkOutTime} class="w-full bg-transparent text-sm outline-none" />
        </div>
      </div>
    </div>
  </div>

  <!-- Dual-month calendar -->
  <div>
    <div class="mb-3 flex items-center justify-between">
      <button type="button" onclick={prev} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <span class="text-sm font-medium">{MONTHS[viewMonth]} {viewYear} – {MONTHS[m2]} {y2}</span>
      <button type="button" onclick={next} class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>

    <div class="flex gap-6">
      {#each [[viewYear, viewMonth, leftDays], [y2, m2, rightDays]] as [y, m, days]}
        <div>
          <h3 class="mb-2 text-center text-xs font-medium text-muted-foreground">{MONTHS[m as number]} {y}</h3>
          <div class="grid grid-cols-7">
            {#each DAYS as d}
              <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
            {/each}
            {#each (days as Array<{day:number;cur:boolean}>) as { day, cur }}
              <button
                type="button"
                class={cn(
                  'flex h-8 w-8 items-center justify-center text-sm transition-colors',
                  !cur && 'text-muted-foreground/40 pointer-events-none',
                  cur && inRange(y as number, m as number, day) && !isEdge(y as number, m as number, day) && 'bg-muted',
                  cur && isEdge(y as number, m as number, day) && 'rounded-full bg-primary text-primary-foreground',
                  cur && !inRange(y as number, m as number, day) && 'rounded-full hover:bg-muted'
                )}
                onclick={() => cur && handleDayClick(y as number, m as number, day)}
                disabled={!cur}
              >{day}</button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
