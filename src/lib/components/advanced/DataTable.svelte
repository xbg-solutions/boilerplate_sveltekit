<!--
  Advanced DataTable Component

  Features:
  - Sorting, filtering, pagination
  - Column customization and resizing
  - Row selection and bulk actions
  - Export functionality
  - Loading and error states
  - Responsive design
-->
<script lang="ts" module>
  // Types
  export interface Column<T = any> {
    key: string;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T) => string;
    component?: any;
    hidden?: boolean;
    /** When true, render() output is injected as raw HTML (opt-in). Default: false (escaped). */
    allowHtml?: boolean;
  }

  export interface DataTableOptions {
    pagination?: boolean;
    pageSize?: number;
    sorting?: boolean;
    filtering?: boolean;
    selection?: boolean;
    bulkActions?: boolean;
    export?: boolean;
    responsive?: boolean;
    striped?: boolean;
    bordered?: boolean;
    hover?: boolean;
  }

  export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
  }

  export interface FilterConfig {
    [key: string]: string | number | boolean;
  }

  export interface BulkAction {
    key: string;
    label: string;
    icon?: any;
    variant?: 'default' | 'destructive' | 'secondary';
    confirm?: boolean;
  }
</script>

<script lang="ts">
  import { escapeHtml } from '@xbg.solutions/bpsk-utils-sanitizer';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from '$lib/components/ui/table';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
  } from '$lib/components/ui/dropdown-menu';
  import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Search,
    Filter,
    Download,
    Trash2,
    RefreshCw,
    Settings,
    Eye,
    EyeOff
  } from 'lucide-svelte';

  // Props
  let {
    data = [],
    columns = [],
    loading = false,
    error = null,
    options = {},
    bulkActions = [],
    emptyMessage = 'No data available',
    loadingMessage = 'Loading...',
    searchPlaceholder = 'Search...',
    className = '',
    onSort,
    onFilter,
    onPaginate,
    onSelect,
    onBulkAction,
    onRowClick,
    onExport,
    onRefresh,
  }: {
    data?: any[];
    columns?: Column[];
    loading?: boolean;
    error?: string | null;
    options?: DataTableOptions;
    bulkActions?: BulkAction[];
    emptyMessage?: string;
    loadingMessage?: string;
    searchPlaceholder?: string;
    className?: string;
    onSort?: (detail: { column: string; direction: 'asc' | 'desc' }) => void;
    onFilter?: (detail: FilterConfig) => void;
    onPaginate?: (detail: { page: number; pageSize: number }) => void;
    onSelect?: (detail: { selected: any[]; row?: any }) => void;
    onBulkAction?: (detail: { action: string; items: any[] }) => void;
    onRowClick?: (row: any) => void;
    onExport?: (detail: { format: string; data: any[] }) => void;
    onRefresh?: () => void;
  } = $props();

  // Default options
  const defaultOptions: DataTableOptions = {
    pagination: true,
    pageSize: 10,
    sorting: true,
    filtering: true,
    selection: false,
    bulkActions: false,
    export: true,
    responsive: true,
    striped: true,
    bordered: false,
    hover: true,
    ...options
  };

  // State
  let searchQuery = $state('');
  let sortConfigState = $state<SortConfig | null>(null);
  let filterConfigState = $state<FilterConfig>({});
  let currentPage = $state(1);
  let pageSizeState = $state(defaultOptions.pageSize || 10);
  let selectedRows = $state<Set<any>>(new Set());
  let visibleColumnsSet = $state<Set<string>>(new Set(columns.map(c => c.key)));

  let selectAllChecked = $state(false);
  let selectAllIndeterminate = $state(false);

  // Computed values
  let filteredData = $derived.by(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply column filters
    Object.entries(filterConfigState).forEach(([key, filterValue]) => {
      if (filterValue !== '' && filterValue != null) {
        filtered = filtered.filter(row => {
          const value = row[key];
          if (typeof filterValue === 'string') {
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          }
          return value === filterValue;
        });
      }
    });

    return filtered;
  });

  let sortedData = $derived.by(() => {
    if (!sortConfigState) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfigState!.key];
      const bVal = b[sortConfigState!.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfigState!.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortConfigState!.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfigState!.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  });

  let paginatedData = $derived.by(() => {
    if (!defaultOptions.pagination) return sortedData;

    const start = (currentPage - 1) * pageSizeState;
    const end = start + pageSizeState;
    return sortedData.slice(start, end);
  });

  let totalPages = $derived(Math.ceil(sortedData.length / pageSizeState));

  let displayedColumns = $derived(columns.filter(col => visibleColumnsSet.has(col.key)));

  // Update select all state when paginated data changes
  $effect(() => {
    paginatedData;
    updateSelectAllState();
  });

  // Functions
  function handleSort(column: Column) {
    if (!column.sortable) return;

    if (sortConfigState?.key === column.key) {
      if (sortConfigState.direction === 'asc') {
        sortConfigState = { key: column.key, direction: 'desc' };
      } else {
        sortConfigState = null;
      }
    } else {
      sortConfigState = { key: column.key, direction: 'asc' };
    }

    if (sortConfigState) {
      onSort?.({ column: sortConfigState.key, direction: sortConfigState.direction });
    }
  }

  function handleFilter(key: string, value: string) {
    filterConfigState = {
      ...filterConfigState,
      [key]: value
    };

    onFilter?.(filterConfigState);
  }

  function handlePageChange(page: number) {
    currentPage = page;
    onPaginate?.({ page: currentPage, pageSize: pageSizeState });
  }

  function handleRowSelect(row: any, checked: boolean) {
    const newSet = new Set(selectedRows);
    if (checked) {
      newSet.add(row);
    } else {
      newSet.delete(row);
    }
    selectedRows = newSet;

    updateSelectAllState();
    onSelect?.({ selected: Array.from(selectedRows), row });
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      selectedRows = new Set(paginatedData);
    } else {
      selectedRows = new Set();
    }

    updateSelectAllState();
    onSelect?.({ selected: Array.from(selectedRows) });
  }

  function updateSelectAllState() {
    const selected = selectedRows.size;
    const total = paginatedData.length;

    selectAllChecked = selected > 0 && selected === total;
    selectAllIndeterminate = selected > 0 && selected < total;
  }

  function handleBulkAction(actionKey: string) {
    const action = bulkActions.find(a => a.key === actionKey);
    if (!action) return;

    const items = Array.from(selectedRows);

    if (action.confirm) {
      if (!confirm(`Are you sure you want to ${action.label.toLowerCase()} ${items.length} item(s)?`)) {
        return;
      }
    }

    onBulkAction?.({ action: actionKey, items });
  }

  function handleExport(format: 'csv' | 'json' | 'xlsx') {
    onExport?.({ format, data: sortedData });
  }

  function toggleColumnVisibility(columnKey: string) {
    const newSet = new Set(visibleColumnsSet);
    if (newSet.has(columnKey)) {
      newSet.delete(columnKey);
    } else {
      newSet.add(columnKey);
    }
    visibleColumnsSet = newSet;
  }

  function renderCellContent(column: Column, row: any) {
    const value = row[column.key];

    if (column.render) {
      const rendered = column.render(value, row);
      // Only skip escaping when the column explicitly opts in to raw HTML
      return column.allowHtml ? rendered : escapeHtml(rendered);
    }

    if (column.component) {
      return null; // Will render component separately
    }

    return escapeHtml(value?.toString() || '');
  }

  function getCellAlignment(column: Column): string {
    switch (column.align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  }
</script>

<div class="data-table-container {className}">
  <!-- Toolbar -->
  <div class="data-table-toolbar flex items-center justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
    <div class="flex items-center gap-2 flex-1">
      <!-- Search -->
      {#if defaultOptions.filtering}
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            bind:value={searchQuery}
            placeholder={searchPlaceholder}
            class="pl-10 w-64"
          />
        </div>
      {/if}

      <!-- Bulk Actions -->
      {#if defaultOptions.bulkActions && selectedRows.size > 0}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm">
              Actions ({selectedRows.size})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {#each bulkActions as action}
              <DropdownMenuItem onclick={() => handleBulkAction(action.key)}>
                {#if action.icon}
                  <svelte:component this={action.icon} class="w-4 h-4 mr-2" />
                {/if}
                {action.label}
              </DropdownMenuItem>
            {/each}
          </DropdownMenuContent>
        </DropdownMenu>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <!-- Column Visibility -->
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Settings class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {#each columns as column}
            <DropdownMenuItem onclick={() => toggleColumnVisibility(column.key)}>
              {#if visibleColumnsSet.has(column.key)}
                <Eye class="w-4 h-4 mr-2" />
              {:else}
                <EyeOff class="w-4 h-4 mr-2" />
              {/if}
              {column.title}
            </DropdownMenuItem>
          {/each}
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Export -->
      {#if defaultOptions.export}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm">
              <Download class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onclick={() => handleExport('csv')}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onclick={() => handleExport('json')}>
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem onclick={() => handleExport('xlsx')}>
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      {/if}

      <!-- Refresh -->
      <Button variant="outline" size="sm" onclick={() => onRefresh?.()}>
        <RefreshCw class="w-4 h-4" />
      </Button>
    </div>
  </div>

  <!-- Table -->
  <div class="data-table-wrapper rounded-lg border {defaultOptions.responsive ? 'overflow-x-auto' : ''}">
    <Table class="{defaultOptions.striped ? 'table-striped' : ''} {defaultOptions.bordered ? 'table-bordered' : ''} {defaultOptions.hover ? 'table-hover' : ''}">
      <TableHeader>
        <TableRow>
          {#if defaultOptions.selection}
            <TableHead class="w-12">
              <Checkbox
                checked={selectAllChecked}
                indeterminate={selectAllIndeterminate}
                onchange={(e: Event) => handleSelectAll((e.target as HTMLInputElement).checked)}
              />
            </TableHead>
          {/if}

          {#each displayedColumns as column}
            <TableHead
              class="cursor-pointer select-none {getCellAlignment(column)}"
              style={column.width ? `width: ${column.width}` : ''}
              onclick={() => handleSort(column)}
            >
              <div class="flex items-center gap-1">
                <span>{column.title}</span>
                {#if column.sortable}
                  {#if sortConfigState?.key === column.key}
                    {#if sortConfigState.direction === 'asc'}
                      <ChevronUp class="w-4 h-4" />
                    {:else}
                      <ChevronDown class="w-4 h-4" />
                    {/if}
                  {:else}
                    <div class="w-4 h-4"></div>
                  {/if}
                {/if}
              </div>

              <!-- Column Filter -->
              {#if column.filterable}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="mt-1" onclick={(e: MouseEvent) => e.stopPropagation()}>
                  <Input
                    value={filterConfigState[column.key]?.toString() || ''}
                    placeholder="Filter..."
                    size="sm"
                    class="h-6 text-xs"
                    oninput={(e: Event) => handleFilter(column.key, (e.target as HTMLInputElement).value)}
                  />
                </div>
              {/if}
            </TableHead>
          {/each}

          <!-- Actions column -->
          <TableHead class="w-12"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {#if loading}
          <TableRow>
            <TableCell colspan={displayedColumns.length + 2} class="text-center py-8">
              <div class="flex items-center justify-center gap-2">
                <RefreshCw class="w-4 h-4 animate-spin" />
                {loadingMessage}
              </div>
            </TableCell>
          </TableRow>
        {:else if error}
          <TableRow>
            <TableCell colspan={displayedColumns.length + 2} class="text-center py-8 text-red-600">
              {error}
            </TableCell>
          </TableRow>
        {:else if paginatedData.length === 0}
          <TableRow>
            <TableCell colspan={displayedColumns.length + 2} class="text-center py-8 text-gray-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        {:else}
          {#each paginatedData as row, index}
            <TableRow
              class="cursor-pointer"
              onclick={() => onRowClick?.(row)}
            >
              {#if defaultOptions.selection}
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(row)}
                    onchange={(e: Event) => handleRowSelect(row, (e.target as HTMLInputElement).checked)}
                    onclick={(e: MouseEvent) => e.stopPropagation()}
                  />
                </TableCell>
              {/if}

              {#each displayedColumns as column}
                <TableCell class={getCellAlignment(column)}>
                  {#if column.component}
                    <svelte:component this={column.component} {row} {column} value={row[column.key]} />
                  {:else}
                    {@html renderCellContent(column, row)}
                  {/if}
                </TableCell>
              {/each}

              <!-- Row Actions -->
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="sm" onclick={(e: MouseEvent) => e.stopPropagation()}>
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-600">
                      <Trash2 class="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </div>

  <!-- Pagination -->
  {#if defaultOptions.pagination && totalPages > 1}
    <div class="data-table-pagination flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
      <div class="text-sm text-gray-600">
        Showing {(currentPage - 1) * pageSizeState + 1} to {Math.min(currentPage * pageSizeState, sortedData.length)} of {sortedData.length} entries
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onclick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </Button>

        <div class="flex items-center gap-1">
          {#each Array(totalPages) as _, page}
            {#if page + 1 === currentPage || Math.abs(page + 1 - currentPage) <= 2 || page === 0 || page === totalPages - 1}
              <Button
                variant={page + 1 === currentPage ? 'default' : 'outline'}
                size="sm"
                onclick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </Button>
            {:else if Math.abs(page + 1 - currentPage) === 3}
              <span class="px-2">...</span>
            {/if}
          {/each}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onclick={() => handlePageChange(currentPage + 1)}
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .data-table-container :global(.table-striped tbody tr:nth-child(even)) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .data-table-container :global(.table-bordered) {
    border: 1px solid #e2e8f0;
  }

  .data-table-container :global(.table-bordered th),
  .data-table-container :global(.table-bordered td) {
    border: 1px solid #e2e8f0;
  }

  .data-table-container :global(.table-hover tbody tr:hover) {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>