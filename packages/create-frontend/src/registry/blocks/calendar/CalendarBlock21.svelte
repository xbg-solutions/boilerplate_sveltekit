<!--
  CalendarBlock21.svelte
  "Date of birth" field — a dropdown trigger labeled "Select date" that toggles a calendar
  with month/year dropdown selectors.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    label = 'Date of birth',
    placeholder = 'Select date',
    selectedDate = null
  }: {
    class?: string;
    label?: string;
    placeholder?: string;
    selectedDate?: Date | null;
  } = $props();

  const today = new Date();
  let open = $state(false);
  let viewYear = $state(selectedDate?.getFullYear() ?? today.getFullYear());
  let viewMonth = $state(selectedDate?.getMonth() ?? today.getMonth());

  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const YEARS = Array.from({ length: 100 }, (_, i) => today.getFullYear() - 99 + i).reverse();

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

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function selectDay(day: number) {
    selectedDate = new Date(viewYear, viewMonth, day);
    open = false;
  }

  let calDays = $derived(getCalDays(viewYear, viewMonth));
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  {#if label}
    <label class="text-sm font-medium">{label}</label>
  {/if}

  <!-- Trigger button -->
  <button
    type="button"
    onclick={() => (open = !open)}
    class="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted"
  >
    <div class="flex items-center gap-2 text-left">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      <span class={selectedDate ? '' : 'text-muted-foreground'}>{selectedDate ? formatDate(selectedDate) : placeholder}</span>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
  </button>

  <!-- Popover calendar -->
  {#if open}
    <div class="z-10 mt-1 rounded-md border bg-background p-4 shadow-md">
      <!-- Month + Year dropdowns -->
      <div class="mb-4 flex items-center gap-2">
        <select
          bind:value={viewMonth}
          class="flex-1 rounded border bg-background px-2 py-1 text-sm font-medium hover:bg-muted"
        >
          {#each MONTHS as m, i}
            <option value={i}>{m}</option>
          {/each}
        </select>
        <select
          bind:value={viewYear}
          class="rounded border bg-background px-2 py-1 text-sm font-medium hover:bg-muted"
        >
          {#each YEARS as y}
            <option value={y}>{y}</option>
          {/each}
        </select>
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
