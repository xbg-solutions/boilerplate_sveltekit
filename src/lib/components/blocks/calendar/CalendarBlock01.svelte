<!--
  CalendarBlock01.svelte
  Dual month calendar view with navigation and date selection.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    selectedDate = null
  }: {
    class?: string;
    selectedDate?: Date | null;
  } = $props();

  // Internal state: first month displayed
  // svelte-ignore state_referenced_locally
  let viewYear = $state(selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
  // svelte-ignore state_referenced_locally
  let viewMonth = $state(selectedDate ? selectedDate.getMonth() : new Date().getMonth());

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  function getCalendarDays(year: number, month: number): Array<{ day: number; current: boolean }> {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const days: Array<{ day: number; current: boolean }> = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, current: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, current: true });
    }

    // Next month's leading days to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false });
    }

    return days;
  }

  function isSelected(year: number, month: number, day: number): boolean {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month &&
           selectedDate.getDate() === day;
  }

  function selectDay(year: number, month: number, day: number) {
    selectedDate = new Date(year, month, day);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear--;
    } else {
      viewMonth--;
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear++;
    } else {
      viewMonth++;
    }
  }

  // Second month
  let secondMonth = $derived(viewMonth === 11 ? 0 : viewMonth + 1);
  let secondYear = $derived(viewMonth === 11 ? viewYear + 1 : viewYear);

  let leftDays = $derived(getCalendarDays(viewYear, viewMonth));
  let rightDays = $derived(getCalendarDays(secondYear, secondMonth));
</script>

<div class={cn('inline-flex flex-col', className)}>
  <!-- Navigation -->
  <div class="mb-4 flex items-center justify-between">
    <Button variant="outline" size="sm" onclick={prevMonth}>
      <!-- Lucide: ChevronLeft -->
      &lt;
    </Button>
    <span class="text-sm font-medium">
      {MONTHS[viewMonth]} {viewYear} - {MONTHS[secondMonth]} {secondYear}
    </span>
    <Button variant="outline" size="sm" onclick={nextMonth}>
      <!-- Lucide: ChevronRight -->
      &gt;
    </Button>
  </div>

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
              'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
              !current && 'text-muted-foreground/40',
              current && 'hover:bg-muted',
              current && isSelected(viewYear, viewMonth, day) && 'bg-primary text-primary-foreground hover:bg-primary'
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
              'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
              !current && 'text-muted-foreground/40',
              current && 'hover:bg-muted',
              current && isSelected(secondYear, secondMonth, day) && 'bg-primary text-primary-foreground hover:bg-primary'
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
