<!--
  CalendarBlock10.svelte
  Appointment picker: title/subtitle header + "Today" button + single month calendar.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    title = 'Appointment',
    subtitle = 'Find a date',
    selectedDate = null,
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    title?: string;
    subtitle?: string;
    selectedDate?: Date | null;
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

  const today = new Date();
  function isToday(d: number) { return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d; }
  function isSelected(d: number) { return selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === d; }

  function goToday() { const t = new Date(); month = t.getMonth(); year = t.getFullYear(); selectedDate = new Date(); }
  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <!-- Title row -->
  <div class="mb-4 flex items-start justify-between">
    <div>
      <h3 class="font-semibold">{title}</h3>
      <p class="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    <Button variant="outline" size="sm" onclick={goToday}>Today</Button>
  </div>

  <!-- Month nav -->
  <div class="mb-3 flex items-center justify-between">
    <button type="button" onclick={prev} aria-label="Previous month" class="rounded p-1 hover:bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span class="text-sm font-medium">{MONTHS[month]} {year}</span>
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
          cur && isToday(day) && !isSelected(day) && 'border border-primary text-primary',
          cur && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
        )}
        onclick={() => cur && (selectedDate = new Date(year, month, day))}
        disabled={!cur}
      >{day}</button>
    {/each}
  </div>
</div>
