<!--
  src/lib/components/ui/Pagination.svelte
  SHADCN-Svelte Pagination Component

  AI SYSTEMS: Use this component for paginated navigation.
  Supports keyboard navigation and proper accessibility.
-->
<script lang="ts">
  import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  let {
    currentPage = $bindable(1),
    totalPages = 1,
    showFirstLast = true,
    showPrevNext = true,
    maxVisiblePages = 5,
    disabled = false,
    onPageChange,
  }: {
    currentPage?: number;
    totalPages?: number;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    maxVisiblePages?: number;
    disabled?: boolean;
    onPageChange?: (detail: { page: number }) => void;
  } = $props();

  // Calculate visible page numbers
  let visiblePages = $derived(calculateVisiblePages(currentPage, totalPages, maxVisiblePages));

  function calculateVisiblePages(current: number, total: number, maxVisible: number): (number | 'ellipsis')[] {
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total) {
      if (end < total - 1) {
        pages.push('ellipsis');
      }
      pages.push(total);
    }

    return pages;
  }

  // Handle page change
  function changePage(page: number) {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    currentPage = page;
    onPageChange?.({ page });
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent, page: number | 'ellipsis') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (typeof page === 'number') {
        changePage(page);
      }
    }
  }
</script>

<nav aria-label="pagination" class="mx-auto flex w-full justify-center">
  <ul class="flex flex-row items-center gap-1">
    <!-- First page button -->
    {#if showFirstLast && currentPage > 1}
      <li>
        <button
          type="button"
          class={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent hover:text-accent-foreground h-8 px-3'
          )}
          {disabled}
          onclick={() => changePage(1)}
        >
          First
        </button>
      </li>
    {/if}

    <!-- Previous page button -->
    {#if showPrevNext}
      <li>
        <button
          type="button"
          class={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent hover:text-accent-foreground h-8 px-3'
          )}
          disabled={disabled || currentPage <= 1}
          onclick={() => changePage(currentPage - 1)}
        >
          <ChevronLeft class="h-4 w-4" />
          <span class="sr-only">Previous page</span>
        </button>
      </li>
    {/if}

    <!-- Page numbers -->
    {#each visiblePages as page}
      <li>
        {#if page === 'ellipsis'}
          <span class="flex h-8 w-8 items-center justify-center">
            <MoreHorizontal class="h-4 w-4" />
            <span class="sr-only">More pages</span>
          </span>
        {:else}
          <button
            type="button"
            class={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50',
              'h-8 w-8',
              page === currentPage
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            {disabled}
            onclick={() => changePage(page)}
            onkeydown={(e) => handleKeydown(e, page)}
          >
            {page}
          </button>
        {/if}
      </li>
    {/each}

    <!-- Next page button -->
    {#if showPrevNext}
      <li>
        <button
          type="button"
          class={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent hover:text-accent-foreground h-8 px-3'
          )}
          disabled={disabled || currentPage >= totalPages}
          onclick={() => changePage(currentPage + 1)}
        >
          <ChevronRight class="h-4 w-4" />
          <span class="sr-only">Next page</span>
        </button>
      </li>
    {/if}

    <!-- Last page button -->
    {#if showFirstLast && currentPage < totalPages}
      <li>
        <button
          type="button"
          class={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent hover:text-accent-foreground h-8 px-3'
          )}
          {disabled}
          onclick={() => changePage(totalPages)}
        >
          Last
        </button>
      </li>
    {/if}
  </ul>
</nav>
