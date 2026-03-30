<!--
  CalendarBlock18.svelte
  Two single-month calendars displayed side by side (responsive: stacks on mobile).
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

  const today = new Date();

  let leftYear = $state(today.getFullYear());
  let leftMonth = $state(today.getMonth());
  let rightYear = $derived(leftMonth === 11 ? leftYear + 1 : leftYear);
  let rightMonth = $derived(leftMonth === 11 ? 0 : leftMonth + 1);

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

  function isSelected(y: number, m: number, d: number) {
    return selectedDate?.getFullYear() === y && selectedDate?.getMonth() === m && selectedDate?.getDate() === d;
  }
  function isToday(y: number, m: number, d: number) {
    return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
  }

  function prev() { if (leftMonth === 0) { leftMonth = 11; leftYear--; } else leftMonth--; }
  function next() { if (leftMonth === 11) { leftMonth = 0; leftYear++; } else leftMonth++; }

  let leftDays = $derived(getCalDays(leftYear, leftMonth));
  let rightDays = $derived(getCalDays(rightYear, rightMonth));
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <div class="mb-4 flex items-center justify-between">
    <Button variant="ghost" size="sm" onclick={prev}>&lt;</Button>
    <span class="text-sm font-medium">{MONTHS[leftMonth]} {leftYear} – {MONTHS[rightMonth]} {rightYear}</span>
    <Button variant="ghost" size="sm" onclick={next}>&gt;</Button>
  </div>

  <div class="flex flex-col gap-6 sm:flex-row sm:gap-8">
    {#each [[leftYear, leftMonth, leftDays], [rightYear, rightMonth, rightDays]] as [y, m, days]}
      <div class="flex flex-col">
        <h3 class="mb-2 text-center text-sm font-medium">{MONTHS[m as number]} {y}</h3>
        <div class="grid grid-cols-7">
          {#each DAYS as d}
            <div class="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
          {/each}
          {#each (days as Array<{day:number;cur:boolean}>) as { day, cur }}
            <button
              type="button"
              class={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
                !cur && 'text-muted-foreground/40 pointer-events-none',
                cur && 'hover:bg-muted',
                cur && isToday(y as number, m as number, day) && !isSelected(y as number, m as number, day) && 'border border-primary text-primary',
                cur && isSelected(y as number, m as number, day) && 'bg-primary text-primary-foreground hover:bg-primary'
              )}
              onclick={() => cur && (selectedDate = new Date(y as number, m as number, day))}
              disabled={!cur}
            >{day}</button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
