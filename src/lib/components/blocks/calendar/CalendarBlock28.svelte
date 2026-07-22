<!--
  CalendarBlock28.svelte
  "Schedule Date" — a relative-date input showing e.g. "In 2 Days" with
  a text field and an inline single-month calendar.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    label = 'Schedule Date',
    selectedDate = null,
    relativeLabel = 'In 2 Days'
  }: {
    class?: string;
    label?: string;
    selectedDate?: Date | null;
    relativeLabel?: string;
  } = $props();

  const today = new Date();
  // svelte-ignore state_referenced_locally
  let month = $state(selectedDate?.getMonth() ?? today.getMonth());
  // svelte-ignore state_referenced_locally
  let year = $state(selectedDate?.getFullYear() ?? today.getFullYear());
  // svelte-ignore state_referenced_locally
  let inputValue = $state(relativeLabel);

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

  function isSelected(d: number) { return selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === d; }
  function isToday(d: number) { return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d; }

  function selectDay(day: number) {
    selectedDate = new Date(year, month, day);
    // Update relative label to reflect actual date
    const diff = Math.round((selectedDate.getTime() - today.setHours(0,0,0,0)) / 86400000);
    if (diff === 0) inputValue = 'Today';
    else if (diff === 1) inputValue = 'Tomorrow';
    else if (diff > 0) inputValue = `In ${diff} Days`;
    else inputValue = `${Math.abs(diff)} Days ago`;
  }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
</script>

<div class={cn('flex flex-col gap-2 rounded-md border p-4', className)}>
  {#if label}
    <label for="calendar28-date" class="text-sm font-medium">{label}</label>
  {/if}

  <!-- Relative date input -->
  <div class="flex items-center gap-2 rounded-md border px-3 py-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <input
      id="calendar28-date"
      type="text"
      bind:value={inputValue}
      class="flex-1 bg-transparent text-sm outline-none"
      placeholder="e.g. In 2 Days"
    />
    {#if selectedDate}
      <span class="text-xs text-muted-foreground">
        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    {/if}
  </div>

  <!-- Month navigator -->
  <div class="flex items-center justify-between">
    <button type="button" onclick={prev} aria-label="Previous month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span class="text-sm font-medium">{MONTHS[month]} {year}</span>
    <button type="button" onclick={next} aria-label="Next month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>

  <!-- Calendar grid -->
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
