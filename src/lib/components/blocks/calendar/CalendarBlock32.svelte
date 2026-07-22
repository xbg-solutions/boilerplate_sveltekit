<!--
  CalendarBlock32.svelte
  Side-by-side appointment booking — single month calendar on the left,
  scrollable 15-min time slot list on the right, with a booking confirmation
  summary and a Continue button at the bottom.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    selectedDate = null,
    selectedSlot = null as string | null,
    title = 'Book a time',
    subtitle = 'Select a date and time slot',
    slots = generateSlots(),
    oncontinue = (_date: Date | null, _slot: string | null) => {}
  }: {
    class?: string;
    selectedDate?: Date | null;
    selectedSlot?: string | null;
    title?: string;
    subtitle?: string;
    slots?: string[];
    oncontinue?: (date: Date | null, slot: string | null) => void;
  } = $props();

  function generateSlots(): string[] {
    const result: string[] = [];
    for (let h = 9; h < 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        result.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      }
    }
    return result;
  }

  const today = new Date();
  // svelte-ignore state_referenced_locally
  let month = $state(selectedDate?.getMonth() ?? today.getMonth());
  // svelte-ignore state_referenced_locally
  let year = $state(selectedDate?.getFullYear() ?? today.getFullYear());

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
  function isToday(d: number) { return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d; }
  function isPast(d: number) {
    const t = new Date(year, month, d);
    t.setHours(23,59,59,999);
    return t < today;
  }

  function formatBooking() {
    if (!selectedDate || !selectedSlot) return null;
    return `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${selectedSlot}`;
  }

  function prev() { if (month === 0) { month = 11; year--; } else month--; }
  function next() { if (month === 11) { month = 0; year++; } else month++; }
  let calDays = $derived(getCalDays(year, month));
  let booking = $derived(formatBooking());
</script>

<div class={cn('flex flex-col gap-4 rounded-xl border bg-background p-5', className)}>
  <!-- Header -->
  <div>
    <h2 class="text-base font-semibold">{title}</h2>
    <p class="text-sm text-muted-foreground">{subtitle}</p>
  </div>

  <!-- Calendar + time slots side by side -->
  <div class="flex gap-4">
    <!-- Calendar -->
    <div class="flex flex-col">
      <div class="mb-3 flex items-center justify-between">
        <button type="button" onclick={prev} aria-label="Previous month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-xs font-medium">{MONTHS[month]} {year}</span>
        <button type="button" onclick={next} aria-label="Next month" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div class="grid grid-cols-7">
        {#each DAYS as d}
          <div class="flex h-7 w-7 items-center justify-center text-[10px] font-medium text-muted-foreground">{d}</div>
        {/each}
        {#each calDays as { day, cur }}
          <button
            type="button"
            class={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors',
              (!cur || isPast(day)) && 'text-muted-foreground/40 pointer-events-none',
              cur && !isPast(day) && 'hover:bg-muted',
              cur && !isPast(day) && isToday(day) && !isSelected(day) && 'border border-primary text-primary',
              cur && !isPast(day) && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary'
            )}
            onclick={() => { if (cur && !isPast(day)) { selectedDate = new Date(year, month, day); selectedSlot = null; } }}
            disabled={!cur || isPast(day)}
          >{day}</button>
        {/each}
      </div>
    </div>

    <!-- Time slots -->
    <div class="flex flex-col gap-1 overflow-y-auto" style="max-height: 260px; min-width: 90px;">
      <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select a date'}
      </p>
      {#if selectedDate}
        {#each slots as slot}
          <button
            type="button"
            onclick={() => (selectedSlot = slot)}
            class={cn(
              'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted',
              selectedSlot === slot && 'border-primary bg-primary text-primary-foreground hover:bg-primary'
            )}
          >{slot}</button>
        {/each}
      {:else}
        <p class="text-xs text-muted-foreground">Pick a date first</p>
      {/if}
    </div>
  </div>

  <!-- Booking summary + CTA -->
  <div class="flex items-center justify-between border-t pt-4">
    <div class="text-sm">
      {#if booking}
        <p class="font-medium">{booking}</p>
        <p class="text-xs text-muted-foreground">Tap Continue to confirm</p>
      {:else}
        <p class="text-muted-foreground">No time selected yet</p>
      {/if}
    </div>
    <Button
      onclick={() => oncontinue(selectedDate, selectedSlot)}
      disabled={!selectedDate || !selectedSlot}
    >Continue</Button>
  </div>
</div>
