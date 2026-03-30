<!--
  CalendarBlock08.svelte
  Single month with weekends disabled (Mon–Fri only selectable).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    selectedDate = null,
    month = new Date().getMonth(),
    year = new Date().getFullYear()
  }: {
    class?: string;
    selectedDate?: Date | null;
    month?: number;
    year?: number;
  } = $props();

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function getDim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getCalDays(y: number, m: number) {
    const dim = getDim(y, m), fd = new Date(y, m, 1).getDay(), prev = getDim(y, m - 1);
    const days: Array<{ day: number; cur: boolean; dow: number }> = [];
    for (let i = fd - 1; i >= 0; i--) days.push({ day: prev - i, cur: false, dow: (fd - 1 - i + (7 - fd + 1)) % 7 });
    for (let i = 1; i <= dim; i++) days.push({ day: i, cur: true, dow: new Date(y, m, i).getDay() });
    while (days.length < 42) {
      const idx = days.length;
      days.push({ day: idx - dim - fd + 2, cur: false, dow: idx % 7 });
    }
    return days;
  }

  function isSelected(d: number) {
    return selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === d;
  }
  function isWeekend(dow: number) { return dow === 0 || dow === 6; }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
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
    {#each calDays as { day, cur, dow }}
      <button
        type="button"
        class={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
          (!cur || isWeekend(dow)) && 'text-muted-foreground/40 pointer-events-none',
          cur && !isWeekend(dow) && 'hover:bg-muted',
          cur && !isWeekend(dow) && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
        )}
        onclick={() => cur && !isWeekend(dow) && (selectedDate = new Date(year, month, day))}
        disabled={!cur || isWeekend(dow)}
      >{day}</button>
    {/each}
  </div>
</div>
