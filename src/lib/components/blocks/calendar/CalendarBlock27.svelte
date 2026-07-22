<!--
  CalendarBlock27.svelte
  "Subscription Date" — a date input with a calendar icon button that toggles
  an inline single-month calendar popover.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    label = 'Subscription Date',
    selectedDate = null,
    placeholder = 'Pick a date'
  }: {
    class?: string;
    label?: string;
    selectedDate?: Date | null;
    placeholder?: string;
  } = $props();

  const today = new Date();
  let open = $state(false);
  // svelte-ignore state_referenced_locally
  let viewYear = $state(selectedDate?.getFullYear() ?? today.getFullYear());
  // svelte-ignore state_referenced_locally
  let viewMonth = $state(selectedDate?.getMonth() ?? today.getMonth());

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

  function isSelected(d: number) { return selectedDate?.getFullYear() === viewYear && selectedDate?.getMonth() === viewMonth && selectedDate?.getDate() === d; }
  function isToday(d: number) { return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d; }

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function selectDay(day: number) {
    selectedDate = new Date(viewYear, viewMonth, day);
    open = false;
  }

  function prev() { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; }
  function next() { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; }
  let calDays = $derived(getCalDays(viewYear, viewMonth));
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <span class="text-sm font-medium">{label}</span>
  {/if}

  <!-- Input row with calendar icon -->
  <div class="relative flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring">
    <span class="flex h-9 w-9 items-center justify-center text-muted-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
    </span>
    <span class={cn('flex-1 text-sm', !selectedDate && 'text-muted-foreground')}>
      {selectedDate ? formatDate(selectedDate) : placeholder}
    </span>
    <button
      type="button"
      onclick={() => (open = !open)}
      class="flex h-9 w-9 items-center justify-center rounded-r-md hover:bg-muted"
      aria-label="Open calendar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  </div>

  <!-- Calendar popover -->
  {#if open}
    <div class="z-10 rounded-md border bg-background p-4 shadow-md">
      <div class="mb-3 flex items-center justify-between">
        <button type="button" onclick={prev} aria-label="Previous month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onclick={next} aria-label="Next month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
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
              'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
              !cur && 'text-muted-foreground/40 pointer-events-none',
              cur && 'hover:bg-muted',
              cur && isToday(day) && !isSelected(day) && 'border border-primary text-primary',
              cur && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
            )}
            onclick={() => cur && selectDay(day)}
            disabled={!cur}
          >{day}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>
