<!--
  CalendarBlock13.svelte
  Single month with dropdown selectors for Month and Year navigation.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    selectedDate = null
  }: {
    class?: string;
    selectedDate?: Date | null;
  } = $props();

  const today = new Date();
  // svelte-ignore state_referenced_locally
  let viewYear = $state(selectedDate?.getFullYear() ?? today.getFullYear());
  // svelte-ignore state_referenced_locally
  let viewMonth = $state(selectedDate?.getMonth() ?? today.getMonth());

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const YEARS = Array.from({ length: 20 }, (_, i) => today.getFullYear() - 10 + i);

  function getDim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getCalDays(y: number, m: number) {
    const dim = getDim(y, m), fd = new Date(y, m, 1).getDay(), prev = getDim(y, m - 1);
    const days: Array<{ day: number; cur: boolean }> = [];
    for (let i = fd - 1; i >= 0; i--) days.push({ day: prev - i, cur: false });
    for (let i = 1; i <= dim; i++) days.push({ day: i, cur: true });
    while (days.length < 42) days.push({ day: days.length - dim - fd + 2, cur: false });
    return days;
  }

  function isToday(d: number) { return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d; }
  function isSelected(d: number) { return selectedDate?.getFullYear() === viewYear && selectedDate?.getMonth() === viewMonth && selectedDate?.getDate() === d; }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }
  let calDays = $derived(getCalDays(viewYear, viewMonth));
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <div class="mb-4 flex items-center justify-between gap-2">
    <button type="button" onclick={prev} aria-label="Previous month" class="rounded p-1 hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>

    <!-- Month dropdown -->
    <select
      bind:value={viewMonth}
      class="rounded border bg-background px-2 py-1 text-sm font-medium hover:bg-muted"
    >
      {#each MONTHS as m, i}
        <option value={i}>{m}</option>
      {/each}
    </select>

    <!-- Year dropdown -->
    <select
      bind:value={viewYear}
      class="rounded border bg-background px-2 py-1 text-sm font-medium hover:bg-muted"
    >
      {#each YEARS as y}
        <option value={y}>{y}</option>
      {/each}
    </select>

    <button type="button" onclick={next} aria-label="Next month" class="rounded p-1 hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
          'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
          !cur && 'text-muted-foreground/40 pointer-events-none',
          cur && 'hover:bg-muted',
          cur && isToday(day) && !isSelected(day) && 'bg-muted font-semibold',
          cur && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
        )}
        onclick={() => cur && (selectedDate = new Date(viewYear, viewMonth, day))}
        disabled={!cur}
      >{day}</button>
    {/each}
  </div>
</div>
