<!--
  SectionFooter05.svelte
  Pagination row: ← Previous | 1–7 of 120 | Next →
  Mobile: icon-only prev/next buttons flanking the count.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    page = 1,
    pageSize = 7,
    total = 120,
    onprev = () => {},
    onnext = () => {}
  }: {
    class?: string;
    page?: number;
    pageSize?: number;
    total?: number;
    onprev?: () => void;
    onnext?: () => void;
  } = $props();

  const start = $derived((page - 1) * pageSize + 1);
  const end = $derived(Math.min(page * pageSize, total));
  const hasPrev = $derived(page > 1);
  const hasNext = $derived(end < total);
</script>

<div class={cn('flex items-center justify-between gap-4 py-4', className)}>
  <!-- Desktop Previous -->
  <Button
    variant="outline"
    size="sm"
    onclick={onprev}
    disabled={!hasPrev}
    class="hidden gap-1 sm:inline-flex"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    Previous
  </Button>

  <!-- Mobile Previous (icon only) -->
  <Button variant="outline" size="icon" class="h-8 w-8 sm:hidden" onclick={onprev} disabled={!hasPrev}>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  </Button>

  <!-- Count -->
  <span class="text-sm text-muted-foreground">{start}–{end} of {total}</span>

  <!-- Desktop Next -->
  <Button
    variant="outline"
    size="sm"
    onclick={onnext}
    disabled={!hasNext}
    class="hidden gap-1 sm:inline-flex"
  >
    Next
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </Button>

  <!-- Mobile Next (icon only) -->
  <Button variant="outline" size="icon" class="h-8 w-8 sm:hidden" onclick={onnext} disabled={!hasNext}>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </Button>
</div>
