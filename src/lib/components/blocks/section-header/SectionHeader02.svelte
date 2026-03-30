<!--
  SectionHeader02.svelte
  Title + Status badge + description left. Search + View/Edit/Create New right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    title = 'Storage',
    badge = 'Status',
    description = 'Read and write directly to databases and stores from your projects.',
    searchPlaceholder = 'Search',
    onview = () => {},
    onedit = () => {},
    oncreate = () => {}
  }: {
    class?: string;
    title?: string;
    badge?: string;
    description?: string;
    searchPlaceholder?: string;
    onview?: () => void;
    onedit?: () => void;
    oncreate?: () => void;
  } = $props();
</script>

<div class={cn('py-4', className)}>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <!-- Left: title + badge + description -->
    <div>
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold">{title}</h2>
        {#if badge}
          <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">{badge}</span>
        {/if}
      </div>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>

    <!-- Right: search + actions -->
    <div class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
      <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder={searchPlaceholder} class="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" onclick={onview}>View</Button>
        <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
        <Button size="sm" onclick={oncreate}>Create new</Button>
      </div>
    </div>
  </div>
</div>
