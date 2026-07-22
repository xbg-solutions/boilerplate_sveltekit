<!--
  CalendarBlock31.svelte
  Bottom-sheet / drawer calendar — dark overlay behind a white card that slides up
  from the bottom, with a drag handle and a single-month range picker.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    open = false,
    startDate = null,
    endDate = null,
    title = 'Select Dates',
    onclose = () => {}
  }: {
    class?: string;
    open?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
    title?: string;
    onclose?: () => void;
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
    else endDate = clicked;
  }

  function formatRange() {
    if (!startDate && !endDate) return 'No dates selected';
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (startDate && !endDate) return fmt(startDate);
    const [a, b] = (startDate! <= endDate!) ? [startDate!, endDate!] : [endDate!, startDate!];
    return `${fmt(a)} – ${fmt(b)}`;
  }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }
  let calDays = $derived(getCalDays(viewYear, viewMonth));
</script>

<!-- This component renders as a bottom-sheet overlay -->
<div class={cn('relative', className)}>
  <!-- Trigger button (preview) -->
  <button
    type="button"
    onclick={() => (open = true)}
    class="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-muted"
  >
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      <span class={startDate ? '' : 'text-muted-foreground'}>{formatRange()}</span>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m18 15-6-6-6 6"/></svg>
  </button>

  <!-- Bottom sheet overlay -->
  {#if open}
    <!-- Dark backdrop -->
    <div
      class="fixed inset-0 z-40 bg-black/50"
      onclick={() => { open = false; onclose(); }}
      role="presentation"
    ></div>

    <!-- Sheet -->
    <div class="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-background shadow-xl">
      <!-- Drag handle -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="h-1 w-10 rounded-full bg-muted-foreground/30"></div>
      </div>

      <div class="p-5">
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onclick={() => { open = false; onclose(); }}
            aria-label="Close"
            class="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Month nav -->
        <div class="mb-3 flex items-center justify-between">
          <button type="button" onclick={prev} aria-label="Previous month" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span class="text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
          <button type="button" onclick={next} aria-label="Next month" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7">
          {#each DAYS as d}
            <div class="flex h-10 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
          {/each}
          {#each calDays as { day, cur }}
            <button
              type="button"
              class={cn(
                'flex h-10 items-center justify-center text-sm transition-colors',
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

        <!-- Range summary + actions -->
        <div class="mt-4 flex items-center justify-between border-t pt-4">
          <span class="text-sm text-muted-foreground">{formatRange()}</span>
          <button
            type="button"
            onclick={() => { open = false; onclose(); }}
            class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >Apply</button>
        </div>
      </div>
    </div>
  {/if}
</div>
