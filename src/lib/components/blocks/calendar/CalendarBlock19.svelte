<!--
  CalendarBlock19.svelte
  Single month calendar with quick date preset buttons (Today, Tomorrow, In 3 days, In a week, In 2 weeks).
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

  const presets: Array<{ label: string; offset: number }> = [
    { label: 'Today', offset: 0 },
    { label: 'Tomorrow', offset: 1 },
    { label: 'In 3 days', offset: 3 },
    { label: 'In a week', offset: 7 },
    { label: 'In 2 weeks', offset: 14 }
  ];

  function applyPreset(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    selectedDate = d;
    month = d.getMonth();
    year = d.getFullYear();
  }

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

  function isPresetActive(offset: number) {
    if (!selectedDate) return false;
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return selectedDate.toDateString() === d.toDateString();
  }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
</script>

<div class={cn('inline-flex flex-col rounded-md border p-4', className)}>
  <!-- Preset buttons -->
  <div class="mb-4 flex flex-wrap gap-2">
    {#each presets as { label, offset }}
      <button
        type="button"
        onclick={() => applyPreset(offset)}
        class={cn(
          'rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted',
          isPresetActive(offset) && 'border-primary bg-primary text-primary-foreground hover:bg-primary'
        )}
      >{label}</button>
    {/each}
  </div>

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
