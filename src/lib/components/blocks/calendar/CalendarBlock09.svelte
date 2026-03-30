<!--
  CalendarBlock09.svelte
  Dual-month range picker — only past/present dates are selectable (future disabled).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    startDate = null,
    endDate = null
  }: {
    class?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  } = $props();

  const today = new Date();
  const todayTs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

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

  function isFuture(y: number, m: number, d: number) { return new Date(y, m, d).getTime() > todayTs; }
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
    if (isFuture(y, m, d)) return;
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

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <div class="mb-4 flex items-center justify-between">
    <Button variant="ghost" size="sm" onclick={prev}>&lt;</Button>
    <span class="text-sm font-medium">{MONTHS[viewMonth]} {viewYear} – {MONTHS[m2]} {y2}</span>
    <Button variant="ghost" size="sm" onclick={next}>&gt;</Button>
  </div>
  <div class="flex gap-8">
    {#each [[viewYear,viewMonth,left],[y2,m2,right]] as [y,m,days]}
      <div>
        <h3 class="mb-2 text-center text-sm font-medium">{MONTHS[m as number]} {y}</h3>
        <div class="grid grid-cols-7">
          {#each DAYS as d}
            <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
          {/each}
          {#each (days as Array<{day:number;cur:boolean}>) as { day, cur }}
            {@const future = cur && isFuture(y as number, m as number, day)}
            <button
              type="button"
              class={cn(
                'flex h-8 w-8 items-center justify-center text-sm transition-colors',
                (!cur || future) && 'text-muted-foreground/40 pointer-events-none',
                cur && !future && inRange(y as number,m as number,day) && !isEdge(y as number,m as number,day) && 'bg-muted',
                cur && !future && isEdge(y as number,m as number,day) && 'rounded-full bg-primary text-primary-foreground',
                cur && !future && !inRange(y as number,m as number,day) && 'rounded-full hover:bg-muted'
              )}
              onclick={() => handleClick(y as number, m as number, day)}
              disabled={!cur || future}
            >{day}</button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
