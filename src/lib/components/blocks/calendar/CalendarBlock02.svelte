<!--
  CalendarBlock02.svelte
  Single month calendar view with navigation and date selection.
-->
<script lang="ts">
  import { cn } from '@xbg.solutions/frontend-core';
  import { Button } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  export let selectedDate: Date | null = null;
  export let month: number = selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  export let year: number = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function getDaysInMonth(y: number, m: number): number {
    return new Date(y, m + 1, 0).getDate();
  }

  function getFirstDayOfMonth(y: number, m: number): number {
    return new Date(y, m, 1).getDay();
  }

  function getCalendarDays(y: number, m: number): Array<{ day: number; current: boolean }> {
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDayOfMonth(y, m);
    const daysInPrevMonth = getDaysInMonth(y, m - 1);
    const days: Array<{ day: number; current: boolean }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, current: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, current: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false });
    }
    return days;
  }

  function isSelected(d: number): boolean {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month &&
           selectedDate.getDate() === d;
  }

  function isToday(d: number): boolean {
    const today = new Date();
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === d;
  }

  function selectDay(d: number) {
    selectedDate = new Date(year, month, d);
  }

  function prevMonth() {
    if (month === 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
  }

  function nextMonth() {
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
  }

  $: calendarDays = getCalendarDays(year, month);
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <!-- Header -->
  <div class="mb-4 flex items-center justify-between">
    <Button variant="ghost" size="sm" on:click={prevMonth}>
      <!-- Lucide: ChevronLeft -->
      &lt;
    </Button>
    <h3 class="text-sm font-medium">{MONTHS[month]} {year}</h3>
    <Button variant="ghost" size="sm" on:click={nextMonth}>
      <!-- Lucide: ChevronRight -->
      &gt;
    </Button>
  </div>

  <!-- Day headers -->
  <div class="grid grid-cols-7 gap-0">
    {#each DAYS as day}
      <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">
        {day}
      </div>
    {/each}

    <!-- Calendar days -->
    {#each calendarDays as { day, current }}
      <button
        type="button"
        class={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
          !current && 'text-muted-foreground/40',
          current && 'hover:bg-muted',
          current && isToday(day) && !isSelected(day) && 'border border-primary text-primary',
          current && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
        )}
        on:click={() => current && selectDay(day)}
        disabled={!current}
      >
        {day}
      </button>
    {/each}
  </div>
</div>
