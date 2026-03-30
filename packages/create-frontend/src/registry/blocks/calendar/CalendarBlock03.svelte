<!--
  CalendarBlock03.svelte
  Date range picker with dual month view and range highlighting.
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

  let viewYear = $state(startDate ? startDate.getFullYear() : new Date().getFullYear());
  let viewMonth = $state(startDate ? startDate.getMonth() : new Date().getMonth());

  /** Track whether next click sets start or end */
  let selectingEnd = $state(false);

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

  function dateEquals(a: Date | null, y: number, m: number, d: number): boolean {
    if (!a) return false;
    return a.getFullYear() === y && a.getMonth() === m && a.getDate() === d;
  }

  function isInRange(y: number, m: number, d: number): boolean {
    if (!startDate || !endDate) return false;
    const date = new Date(y, m, d);
    return date > startDate && date < endDate;
  }

  function isRangeStart(y: number, m: number, d: number): boolean {
    return dateEquals(startDate, y, m, d);
  }

  function isRangeEnd(y: number, m: number, d: number): boolean {
    return dateEquals(endDate, y, m, d);
  }

  function selectDay(y: number, m: number, d: number) {
    const date = new Date(y, m, d);
    if (!selectingEnd) {
      startDate = date;
      endDate = null;
      selectingEnd = true;
    } else {
      if (date < startDate!) {
        startDate = date;
        endDate = null;
      } else {
        endDate = date;
        selectingEnd = false;
      }
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { viewMonth = 11; viewYear--; }
    else { viewMonth--; }
  }

  function nextMonth() {
    if (viewMonth === 11) { viewMonth = 0; viewYear++; }
    else { viewMonth++; }
  }

  let secondMonth = $derived(viewMonth === 11 ? 0 : viewMonth + 1);
  let secondYear = $derived(viewMonth === 11 ? viewYear + 1 : viewYear);
  let leftDays = $derived(getCalendarDays(viewYear, viewMonth));
  let rightDays = $derived(getCalendarDays(secondYear, secondMonth));
</script>

<div class={cn('inline-flex flex-col', className)}>
  <!-- Navigation -->
  <div class="mb-4 flex items-center justify-between">
    <Button variant="outline" size="sm" onclick={prevMonth}>
      &lt;
    </Button>
    <span class="text-sm font-medium">
      {MONTHS[viewMonth]} {viewYear} - {MONTHS[secondMonth]} {secondYear}
    </span>
    <Button variant="outline" size="sm" onclick={nextMonth}>
      &gt;
    </Button>
  </div>

  <!-- Range display -->
  {#if startDate || endDate}
    <div class="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
      <span>{startDate ? startDate.toLocaleDateString() : '...'}</span>
      <span>-</span>
      <span>{endDate ? endDate.toLocaleDateString() : '...'}</span>
    </div>
  {/if}

  <div class="flex gap-8">
    <!-- Left Month -->
    <div>
      <h3 class="mb-2 text-center text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</h3>
      <div class="grid grid-cols-7 gap-0">
        {#each DAYS as day}
          <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        {/each}
        {#each leftDays as { day, current }}
          <button
            type="button"
            class={cn(
              'flex h-8 w-8 items-center justify-center text-sm transition-colors',
              !current && 'text-muted-foreground/40',
              current && 'hover:bg-muted',
              current && isInRange(viewYear, viewMonth, day) && 'bg-accent',
              current && isRangeStart(viewYear, viewMonth, day) && 'rounded-l-full bg-primary text-primary-foreground hover:bg-primary',
              current && isRangeEnd(viewYear, viewMonth, day) && 'rounded-r-full bg-primary text-primary-foreground hover:bg-primary',
              current && !isRangeStart(viewYear, viewMonth, day) && !isRangeEnd(viewYear, viewMonth, day) && !isInRange(viewYear, viewMonth, day) && 'rounded-full'
            )}
            onclick={() => current && selectDay(viewYear, viewMonth, day)}
            disabled={!current}
          >
            {day}
          </button>
        {/each}
      </div>
    </div>

    <!-- Right Month -->
    <div>
      <h3 class="mb-2 text-center text-sm font-medium">{MONTHS[secondMonth]} {secondYear}</h3>
      <div class="grid grid-cols-7 gap-0">
        {#each DAYS as day}
          <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        {/each}
        {#each rightDays as { day, current }}
          <button
            type="button"
            class={cn(
              'flex h-8 w-8 items-center justify-center text-sm transition-colors',
              !current && 'text-muted-foreground/40',
              current && 'hover:bg-muted',
              current && isInRange(secondYear, secondMonth, day) && 'bg-accent',
              current && isRangeStart(secondYear, secondMonth, day) && 'rounded-l-full bg-primary text-primary-foreground hover:bg-primary',
              current && isRangeEnd(secondYear, secondMonth, day) && 'rounded-r-full bg-primary text-primary-foreground hover:bg-primary',
              current && !isRangeStart(secondYear, secondMonth, day) && !isRangeEnd(secondYear, secondMonth, day) && !isInRange(secondYear, secondMonth, day) && 'rounded-full'
            )}
            onclick={() => current && selectDay(secondYear, secondMonth, day)}
            disabled={!current}
          >
            {day}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
