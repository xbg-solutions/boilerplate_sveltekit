<!--
  CalendarBlock30.svelte
  Single month calendar with an event agenda list below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface CalEvent {
    date: Date;
    title: string;
    time?: string;
    color?: string;
  }

  let {
    class: className = '',
    selectedDate = null,
    events = [] as CalEvent[],
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    selectedDate?: Date | null;
    events?: CalEvent[];
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

  function isSelected(d: number) { return selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === d; }
  function isToday(d: number) { const t = new Date(); return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d; }
  function hasEvent(d: number) { return events.some(e => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === d); }

  function visibleEvents() {
    if (selectedDate) {
      return events.filter(e => e.date.toDateString() === selectedDate!.toDateString());
    }
    return events.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  function formatEventDate(d: Date) {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
  let agenda = $derived(visibleEvents());
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <div class="mb-4 flex items-center justify-between">
    <Button variant="ghost" size="sm" onclick={prev}>&lt;</Button>
    <h3 class="text-sm font-medium">{MONTHS[month]} {year}</h3>
    <Button variant="ghost" size="sm" onclick={next}>&gt;</Button>
  </div>

  <div class="grid grid-cols-7">
    {#each DAYS as d}
      <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
    {/each}
    {#each calDays as { day, cur }}
      <button
        type="button"
        class={cn(
          'relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
          !cur && 'text-muted-foreground/40 pointer-events-none',
          cur && 'hover:bg-muted',
          cur && isToday(day) && !isSelected(day) && 'border border-primary text-primary',
          cur && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
        )}
        onclick={() => cur && (selectedDate = selectedDate?.getDate() === day && selectedDate?.getMonth() === month ? null : new Date(year, month, day))}
        disabled={!cur}
      >
        {day}
        {#if cur && hasEvent(day)}
          <span class={cn('absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full', isSelected(day) ? 'bg-primary-foreground' : 'bg-primary')}></span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Agenda -->
  {#if agenda.length > 0}
    <div class="mt-4 flex flex-col gap-2 border-t pt-4">
      <h4 class="text-xs font-medium text-muted-foreground">
        {selectedDate ? formatEventDate(selectedDate) : `${MONTHS[month]} ${year}`}
      </h4>
      {#each agenda as event}
        <div class="flex items-start gap-3 rounded-md p-2 hover:bg-muted">
          <div class={cn('mt-1 h-2 w-2 shrink-0 rounded-full', event.color ?? 'bg-primary')}></div>
          <div class="flex flex-col">
            <span class="text-sm font-medium">{event.title}</span>
            {#if event.time}
              <span class="text-xs text-muted-foreground">{event.time}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="mt-4 border-t pt-4">
      <p class="text-center text-xs text-muted-foreground">
        {selectedDate ? 'No events on this day' : 'No events this month'}
      </p>
    </div>
  {/if}
</div>
