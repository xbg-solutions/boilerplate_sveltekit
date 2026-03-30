<!--
  Card05.svelte
  Billing/account card: icon circle + title + more-menu, then key-value rows
  (last invoice date + amount).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface KVRow { label: string; value: string; }

  let {
    class: className = '',
    title = 'Title Text',
    rows = [
      { label: 'Last invoice', value: 'December 13, 2024' },
      { label: 'Amount', value: '$45' }
    ] as KVRow[],
    onmore = () => {}
  }: {
    class?: string;
    title?: string;
    rows?: KVRow[];
    onmore?: () => void;
  } = $props();
</script>

<div class={cn('rounded-lg border bg-background', className)}>
  <!-- Header -->
  <div class="flex items-center gap-3 p-4">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
      {title[0]?.toUpperCase()}
    </div>
    <p class="flex-1 font-semibold">{title}</p>
    <Button variant="ghost" size="icon" class="h-7 w-7" onclick={onmore}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    </Button>
  </div>

  <!-- Key-value rows -->
  {#if rows.length}
    <div class="border-t">
      {#each rows as row, i}
        <div class={cn('flex items-center justify-between px-4 py-2.5 text-sm', i > 0 && 'border-t')}>
          <span class="text-muted-foreground">{row.label}</span>
          <span class="font-medium">{row.value}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
