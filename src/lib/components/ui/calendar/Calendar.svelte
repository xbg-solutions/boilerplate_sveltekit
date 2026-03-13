<!--
  src/lib/components/ui/calendar/Calendar.svelte
  Date picker calendar grid.

  Usage:
  <Calendar bind:selectedDate bind:month bind:year on:select={handleDateSelect} />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { createEventDispatcher } from 'svelte';

  export let selectedDate: Date | undefined = undefined;
  export let month: number = new Date().getMonth();
  export let year: number = new Date().getFullYear();

  let className: string = '';
  export { className as class };

  const dispatch = createEventDispatcher<{ select: Date }>();

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  $: today = new Date();
  $: todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  $: firstDay = new Date(year, month, 1);
  $: startDayOfWeek = firstDay.getDay();
  $: daysInMonth = new Date(year, month + 1, 0).getDate();
  $: daysInPrevMonth = new Date(year, month, 0).getDate();

  $: monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  interface CalendarDay {
    date: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    key: string;
  }

  $: calendarDays = buildCalendar(year, month, selectedDate);

  function buildCalendar(y: number, m: number, sel: Date | undefined): CalendarDay[] {
    const days: CalendarDay[] = [];

    // Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      days.push({
        date: d, month: pm, year: py,
        isCurrentMonth: false,
        isToday: `${py}-${pm}-${d}` === todayStr,
        isSelected: isSameDate(sel, py, pm, d),
        key: `${py}-${pm}-${d}`
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: d, month: m, year: y,
        isCurrentMonth: true,
        isToday: `${y}-${m}-${d}` === todayStr,
        isSelected: isSameDate(sel, y, m, d),
        key: `${y}-${m}-${d}`
      });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    const nm = m === 11 ? 0 : m + 1;
    const ny = m === 11 ? y + 1 : y;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: d, month: nm, year: ny,
        isCurrentMonth: false,
        isToday: `${ny}-${nm}-${d}` === todayStr,
        isSelected: isSameDate(sel, ny, nm, d),
        key: `${ny}-${nm}-${d}`
      });
    }

    return days;
  }

  function isSameDate(sel: Date | undefined, y: number, m: number, d: number): boolean {
    if (!sel) return false;
    return sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d;
  }

  function selectDay(day: CalendarDay) {
    const newDate = new Date(day.year, day.month, day.date);
    selectedDate = newDate;
    month = day.month;
    year = day.year;
    dispatch('select', newDate);
  }

  function prevMonth() {
    if (month === 0) {
      month = 11;
      year -= 1;
    } else {
      month -= 1;
    }
  }

  function nextMonth() {
    if (month === 11) {
      month = 0;
      year += 1;
    } else {
      month += 1;
    }
  }
</script>

<div class={cn('p-3', className)} {...$$restProps}>
  <!-- Header -->
  <div class="flex items-center justify-between mb-2">
    <button
      type="button"
      class="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      on:click={prevMonth}
      aria-label="Previous month"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="text-sm font-medium">{monthName} {year}</span>
    <button
      type="button"
      class="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      on:click={nextMonth}
      aria-label="Next month"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

  <!-- Day-of-week headers -->
  <div class="grid grid-cols-7 mb-1">
    {#each dayLabels as label}
      <div class="flex items-center justify-center h-8 text-xs text-muted-foreground font-medium">
        {label}
      </div>
    {/each}
  </div>

  <!-- Day grid -->
  <div class="grid grid-cols-7">
    {#each calendarDays as day (day.key)}
      <button
        type="button"
        class={cn(
          'flex items-center justify-center h-8 w-8 mx-auto rounded text-sm transition-colors',
          day.isSelected && 'bg-primary text-primary-foreground',
          !day.isSelected && day.isToday && 'font-bold',
          !day.isSelected && day.isCurrentMonth && 'text-foreground hover:bg-accent',
          !day.isSelected && !day.isCurrentMonth && 'text-muted-foreground hover:bg-accent'
        )}
        on:click={() => selectDay(day)}
      >
        {day.date}
      </button>
    {/each}
  </div>
</div>
