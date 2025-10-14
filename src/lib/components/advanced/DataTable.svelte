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
<script lang="ts" context="module">
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
  import { createEventDispatcher, onMount } from 'svelte';
  import { writable, derived, type Writable } from 'svelte/store';
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
  export let data: any[] = [];
  export let columns: Column[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let options: DataTableOptions = {};
  export let bulkActions: BulkAction[] = [];
  export let emptyMessage = 'No data available';
  export let loadingMessage = 'Loading...';
  export let searchPlaceholder = 'Search...';
  export let className = '';
  
  // Events
  const dispatch = createEventDispatcher<{
    sort: { column: string; direction: 'asc' | 'desc' };
    filter: FilterConfig;
    paginate: { page: number; pageSize: number };
    select: { selected: any[]; row?: any };
    bulkAction: { action: string; items: any[] };
    rowClick: any;
    export: { format: string; data: any[] };
    refresh: void;
  }>();

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
  const searchQuery: Writable<string> = writable('');
  const sortConfig: Writable<SortConfig | null> = writable(null);
  const filterConfig: Writable<FilterConfig> = writable({});
  const currentPage: Writable<number> = writable(1);
  const pageSize: Writable<number> = writable(defaultOptions.pageSize || 10);
  const selectedRows: Writable<Set<any>> = writable(new Set());
  const visibleColumns: Writable<Set<string>> = writable(new Set(columns.map(c => c.key)));
  
  let selectAllChecked = false;
  let selectAllIndeterminate = false;

  // Computed values
  const filteredData = derived(
    [searchQuery, filterConfig],
    ([$searchQuery, $filterConfig]) => {
      let filtered = [...data];

      // Apply search
      if ($searchQuery) {
        const query = $searchQuery.toLowerCase();
        filtered = filtered.filter(row => 
          columns.some(col => {
            const value = row[col.key];
            if (value == null) return false;
            return String(value).toLowerCase().includes(query);
          })
        );
      }

      // Apply column filters
      Object.entries($filterConfig).forEach(([key, filterValue]) => {
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
    }
  );

  const sortedData = derived(
    [filteredData, sortConfig],
    ([$filteredData, $sortConfig]) => {
      if (!$sortConfig) return $filteredData;

      const sorted = [...$filteredData].sort((a, b) => {
        const aVal = a[$sortConfig.key];
        const bVal = b[$sortConfig.key];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return $sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) return $sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return $sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    }
  );

  const paginatedData = derived(
    [sortedData, currentPage, pageSize],
    ([$sortedData, $currentPage, $pageSize]) => {
      if (!defaultOptions.pagination) return $sortedData;
      
      const start = ($currentPage - 1) * $pageSize;
      const end = start + $pageSize;
      return $sortedData.slice(start, end);
    }
  );

  const totalPages = derived(
    [sortedData, pageSize],
    ([$sortedData, $pageSize]) => Math.ceil($sortedData.length / $pageSize)
  );

  const displayedColumns = derived(
    visibleColumns,
    ($visibleColumns) => columns.filter(col => $visibleColumns.has(col.key))
  );

  // Functions
  function handleSort(column: Column) {
    if (!column.sortable) return;

    sortConfig.update(current => {
      if (current?.key === column.key) {
        // Toggle direction or clear sort
        if (current.direction === 'asc') {
          return { key: column.key, direction: 'desc' };
        } else {
          return null; // Clear sort
        }
      } else {
        // Sort by new column
        return { key: column.key, direction: 'asc' };
      }
    });

    sortConfig.subscribe(config => {
      if (config) {
        dispatch('sort', { column: config.key, direction: config.direction });
      }
    });
  }

  function handleFilter(key: string, value: string) {
    filterConfig.update(current => ({
      ...current,
      [key]: value
    }));

    filterConfig.subscribe(config => {
      dispatch('filter', config);
    });
  }

  function handlePageChange(page: number) {
    currentPage.set(page);
    currentPage.subscribe(p => {
      pageSize.subscribe(size => {
        dispatch('paginate', { page: p, pageSize: size });
      });
    });
  }

  function handleRowSelect(row: any, checked: boolean) {
    selectedRows.update(selected => {
      if (checked) {
        selected.add(row);
      } else {
        selected.delete(row);
      }
      return selected;
    });
    
    updateSelectAllState();
    
    selectedRows.subscribe(selected => {
      dispatch('select', { selected: Array.from(selected), row });
    });
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      selectedRows.set(new Set($paginatedData));
    } else {
      selectedRows.set(new Set());
    }
    
    updateSelectAllState();
    
    selectedRows.subscribe(selected => {
      dispatch('select', { selected: Array.from(selected) });
    });
  }

  function updateSelectAllState() {
    const selected = $selectedRows.size;
    const total = $paginatedData.length;
    
    selectAllChecked = selected > 0 && selected === total;
    selectAllIndeterminate = selected > 0 && selected < total;
  }

  function handleBulkAction(actionKey: string) {
    const action = bulkActions.find(a => a.key === actionKey);
    if (!action) return;

    const items = Array.from($selectedRows);
    
    if (action.confirm) {
      if (!confirm(`Are you sure you want to ${action.label.toLowerCase()} ${items.length} item(s)?`)) {
        return;
      }
    }

    dispatch('bulkAction', { action: actionKey, items });
  }

  function handleExport(format: 'csv' | 'json' | 'xlsx') {
    dispatch('export', { format, data: $sortedData });
  }

  function toggleColumnVisibility(columnKey: string) {
    visibleColumns.update(visible => {
      if (visible.has(columnKey)) {
        visible.delete(columnKey);
      } else {
        visible.add(columnKey);
      }
      return visible;
    });
  }

  function renderCellContent(column: Column, row: any) {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.component) {
      return null; // Will render component separately
    }
    
    return value?.toString() || '';
  }

  function getCellAlignment(column: Column): string {
    switch (column.align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  }

  onMount(() => {
    updateSelectAllState();
  });

  // Reactive updates
  $: $paginatedData && updateSelectAllState();
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
            bind:value={$searchQuery}
            placeholder={searchPlaceholder}
            class="pl-10 w-64"
          />
        </div>
      {/if}

      <!-- Bulk Actions -->
      {#if defaultOptions.bulkActions && $selectedRows.size > 0}
        <DropdownMenu>
          <DropdownMenuTrigger asChild let:builder>
            <Button builders={[builder]} variant="outline" size="sm">
              Actions ({$selectedRows.size})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {#each bulkActions as action}
              <DropdownMenuItem on:click={() => handleBulkAction(action.key)}>
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
        <DropdownMenuTrigger asChild let:builder>
          <Button builders={[builder]} variant="outline" size="sm">
            <Settings class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {#each columns as column}
            <DropdownMenuItem on:click={() => toggleColumnVisibility(column.key)}>
              {#if $visibleColumns.has(column.key)}
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
          <DropdownMenuTrigger asChild let:builder>
            <Button builders={[builder]} variant="outline" size="sm">
              <Download class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem on:click={() => handleExport('csv')}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem on:click={() => handleExport('json')}>
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem on:click={() => handleExport('xlsx')}>
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      {/if}

      <!-- Refresh -->
      <Button variant="outline" size="sm" on:click={() => dispatch('refresh')}>
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
                on:change={(e) => handleSelectAll(e.target.checked)}
              />
            </TableHead>
          {/if}
          
          {#each $displayedColumns as column}
            <TableHead 
              class="cursor-pointer select-none {getCellAlignment(column)}"
              style={column.width ? `width: ${column.width}` : ''}
              on:click={() => handleSort(column)}
            >
              <div class="flex items-center gap-1">
                <span>{column.title}</span>
                {#if column.sortable}
                  {#if $sortConfig?.key === column.key}
                    {#if $sortConfig.direction === 'asc'}
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
                <div class="mt-1" on:click|stopPropagation>
                  <Input
                    value={$filterConfig[column.key] || ''}
                    placeholder="Filter..."
                    size="sm"
                    class="h-6 text-xs"
                    on:input={(e) => handleFilter(column.key, e.target.value)}
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
            <TableCell colspan={$displayedColumns.length + 2} class="text-center py-8">
              <div class="flex items-center justify-center gap-2">
                <RefreshCw class="w-4 h-4 animate-spin" />
                {loadingMessage}
              </div>
            </TableCell>
          </TableRow>
        {:else if error}
          <TableRow>
            <TableCell colspan={$displayedColumns.length + 2} class="text-center py-8 text-red-600">
              {error}
            </TableCell>
          </TableRow>
        {:else if $paginatedData.length === 0}
          <TableRow>
            <TableCell colspan={$displayedColumns.length + 2} class="text-center py-8 text-gray-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        {:else}
          {#each $paginatedData as row, index}
            <TableRow 
              class="cursor-pointer"
              on:click={() => dispatch('rowClick', row)}
            >
              {#if defaultOptions.selection}
                <TableCell>
                  <Checkbox
                    checked={$selectedRows.has(row)}
                    on:change={(e) => handleRowSelect(row, e.target.checked)}
                    on:click={(e) => e.stopPropagation()}
                  />
                </TableCell>
              {/if}
              
              {#each $displayedColumns as column}
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
                  <DropdownMenuTrigger asChild let:builder>
                    <Button builders={[builder]} variant="ghost" size="sm" on:click={(e) => e.stopPropagation()}>
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
  {#if defaultOptions.pagination && $totalPages > 1}
    <div class="data-table-pagination flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
      <div class="text-sm text-gray-600">
        Showing {($currentPage - 1) * $pageSize + 1} to {Math.min($currentPage * $pageSize, $sortedData.length)} of {$sortedData.length} entries
      </div>
      
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={$currentPage === 1}
          on:click={() => handlePageChange($currentPage - 1)}
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </Button>
        
        <div class="flex items-center gap-1">
          {#each Array($totalPages) as _, page}
            {#if page + 1 === $currentPage || Math.abs(page + 1 - $currentPage) <= 2 || page === 0 || page === $totalPages - 1}
              <Button
                variant={page + 1 === $currentPage ? 'default' : 'outline'}
                size="sm"
                on:click={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </Button>
            {:else if Math.abs(page + 1 - $currentPage) === 3}
              <span class="px-2">...</span>
            {/if}
          {/each}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          disabled={$currentPage === $totalPages}
          on:click={() => handlePageChange($currentPage + 1)}
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