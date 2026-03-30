<!--
  Card06.svelte
  Task/event card: title + description + checkbox (top-right), divider,
  date/time range + avatar stack. Supports done/not-done state.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Attendee { name: string; avatar?: string; }

  let {
    class: className = '',
    title = 'Title Text',
    description = 'This is a card description.',
    done = false,
    dateTime = 'Today  10:00 PM - 11:45 PM',
    attendees = [] as Attendee[],
    ontoggle = (_: boolean) => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    done?: boolean;
    dateTime?: string;
    attendees?: Attendee[];
    ontoggle?: (value: boolean) => void;
  } = $props();

  let isDone = $state(done);

  function initials(n: string) {
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class={cn('rounded-lg border bg-background p-4', className)}>
  <!-- Header -->
  <div class="flex items-start justify-between gap-2">
    <div class="flex-1 min-w-0">
      <p class={cn('font-semibold', isDone && 'line-through text-muted-foreground')}>{title}</p>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    <!-- Checkbox -->
    <button
      type="button"
      onclick={() => { isDone = !isDone; ontoggle(isDone); }}
      class={cn(
        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
        isDone ? 'border-foreground bg-foreground text-background' : 'border-input bg-background'
      )}
    >
      {#if isDone}
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      {/if}
    </button>
  </div>

  <!-- Footer -->
  <div class="mt-3 flex items-center justify-between border-t pt-3">
    <span class="text-xs text-muted-foreground">{dateTime}</span>
    {#if attendees.length}
      <div class="flex -space-x-2">
        {#each attendees.slice(0, 4) as a}
          <div class="h-6 w-6 overflow-hidden rounded-full border-2 border-background">
            {#if a.avatar}
              <img src={a.avatar} alt={a.name} class="h-full w-full object-cover" />
            {:else}
              <div class="flex h-full w-full items-center justify-center bg-muted text-[8px] font-semibold">{initials(a.name)}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
