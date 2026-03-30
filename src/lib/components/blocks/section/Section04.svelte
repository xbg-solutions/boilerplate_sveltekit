<!--
  Section04.svelte
  Full section with table: SectionHeader (title + description + search + Filters/New) +
  table with head + rows + SectionFooter (Previous / count / Next pagination).
  Supports flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface Column { key: string; label: string; }
  interface Row { [key: string]: string; }

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'Table name',
    description = 'Read and write directly to databases and stores from your projects.',
    searchPlaceholder = 'Search',
    columns = [
      { key: 'col1', label: 'Head Text' },
      { key: 'col2', label: 'Head Text' },
      { key: 'col3', label: 'Head Text' },
      { key: 'col4', label: 'Head Text' },
      { key: 'col5', label: 'Head Text' }
    ] as Column[],
    rows = Array(5).fill(null).map(() =>
      Object.fromEntries([['col1','Table Cell Text'],['col2','Table Cell Text'],['col3','Table Cell Text'],['col4','Table Cell Text'],['col5','Table Cell Text']])
    ) as Row[],
    page = 1,
    pageSize = 7,
    total = 120,
    onfilter = () => {},
    onnew = () => {},
    onprev = () => {},
    onnext = () => {}
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    description?: string;
    searchPlaceholder?: string;
    columns?: Column[];
    rows?: Row[];
    page?: number;
    pageSize?: number;
    total?: number;
    onfilter?: () => void;
    onnew?: () => void;
    onprev?: () => void;
    onnext?: () => void;
  } = $props();

  const start = $derived((page - 1) * pageSize + 1);
  const end = $derived(Math.min(page * pageSize, total));
</script>

<div class={cn(variant === 'card' && 'rounded-lg border bg-background', className)}>
  <!-- Header -->
  <div class={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', variant === 'card' ? 'p-4' : 'py-4')}>
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder={searchPlaceholder} class="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <Button variant="outline" size="sm" onclick={onfilter} class="gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filters
      </Button>
      <Button size="sm" onclick={onnew} class="gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New
      </Button>
    </div>
  </div>

  <!-- Table -->
  <div class={cn('overflow-x-auto', variant === 'card' ? 'border-t' : '')}>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b bg-muted/30">
          {#each columns as col}
            <th class="px-4 py-2.5 text-left font-medium text-muted-foreground">{col.label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rows as row, i}
          <tr class={cn('border-b last:border-0', i % 2 === 0 ? '' : 'bg-muted/20')}>
            {#each columns as col}
              <td class="px-4 py-2.5">{row[col.key] ?? ''}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination footer -->
  <div class={cn('flex items-center justify-between gap-4', variant === 'card' ? 'border-t px-4 py-3' : 'py-3')}>
    <Button variant="outline" size="sm" onclick={onprev} class="gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      <span class="hidden sm:inline">Previous</span>
    </Button>
    <span class="text-sm text-muted-foreground">{start}–{end} of {total}</span>
    <Button variant="outline" size="sm" onclick={onnext} class="gap-1">
      <span class="hidden sm:inline">Next</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </Button>
  </div>
</div>
