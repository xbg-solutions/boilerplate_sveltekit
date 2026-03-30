<!--
  Card04.svelte
  Project card: status badge + title + avatar stack top-right + metadata row
  (category, location, assignee) + status/stage footer + updated timestamp.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Assignee { name: string; avatar?: string; }

  let {
    class: className = '',
    status = 'In progress',
    title = 'Summer Camp',
    category = 'Camp',
    location = 'London, Great Britain',
    assignee = 'Alex Johnson',
    stage = 'Pre-Production (2/4)',
    updatedAt = 'Updated 4h ago',
    assignees = [] as Assignee[]
  }: {
    class?: string;
    status?: string;
    title?: string;
    category?: string;
    location?: string;
    assignee?: string;
    stage?: string;
    updatedAt?: string;
    assignees?: Assignee[];
  } = $props();

  function initials(n: string) {
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class={cn('rounded-lg border bg-background p-4', className)}>
  <!-- Top row: status + avatar stack -->
  <div class="flex items-start justify-between gap-2">
    <span class="inline-flex items-center rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">{status}</span>
    <!-- Avatar stack -->
    {#if assignees.length}
      <div class="flex -space-x-2">
        {#each assignees.slice(0, 5) as a}
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

  <!-- Title -->
  <p class="mt-2 font-bold">{title}</p>

  <!-- Metadata row -->
  <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
    {#if category}
      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/></svg>
        {category}
      </span>
    {/if}
    {#if location}
      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {location}
      </span>
    {/if}
    {#if assignee}
      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {assignee}
      </span>
    {/if}
  </div>

  <!-- Footer -->
  <div class="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
    {#if stage}<span class="font-medium text-foreground">{stage}</span>{/if}
    {#if stage && updatedAt}<span>|</span>{/if}
    {#if updatedAt}<span>{updatedAt}</span>{/if}
  </div>
</div>
