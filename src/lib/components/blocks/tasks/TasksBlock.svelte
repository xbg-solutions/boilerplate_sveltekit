<!--
  TasksBlock.svelte
  Task list table with filtering, pagination, and status/priority badges.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Input,
    Badge,
    Avatar,
    Select,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Checkbox,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
  } from '$lib/components/ui';

  let {
    class: className = '',
    tasks = [],
    title = 'Welcome back!',
    description = "Here's a list of your tasks for this month!",
    onfilter,
    onsort,
    onpageChange
  }: {
    class?: string;
    tasks?: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      priority: string;
    }>;
    title?: string;
    description?: string;
    onfilter?: (data: { search: string; status: string; priority: string }) => void;
    onsort?: (data: { column: string; direction: 'asc' | 'desc' }) => void;
    onpageChange?: (data: { page: number }) => void;
  } = $props();

  // Filter state
  let searchQuery = $state('');
  let statusFilter = $state('');
  let priorityFilter = $state('');

  // Pagination state
  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  let selectedRows: Set<string> = $state(new Set());

  // Status options
  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'Todo' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: '', label: 'All priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // Computed
  let filteredTasks = $derived(tasks.filter(task => {
    const matchesSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }));

  let totalPages = $derived(Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage)));
  let paginatedTasks = $derived(filteredTasks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage));

  function toggleRowSelection(id: string) {
    if (selectedRows.has(id)) {
      selectedRows.delete(id);
    } else {
      selectedRows.add(id);
    }
    selectedRows = new Set(selectedRows);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'todo': return 'bg-yellow-500';
      case 'backlog': return 'bg-gray-400';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  function getTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (type) {
      case 'bug': return 'destructive';
      case 'feature': return 'default';
      case 'documentation': return 'secondary';
      default: return 'outline';
    }
  }

  function handleFilter() {
    currentPage = 1;
    onfilter?.({ search: searchQuery, status: statusFilter, priority: priorityFilter });
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      onpageChange?.({ page });
    }
  }
</script>

<div class={cn('space-y-4', className)}>
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">{title}</h2>
      <p class="text-muted-foreground">{description}</p>
    </div>
    <Avatar alt="User" class="h-10 w-10" />
  </div>

  <!-- Filter Row -->
  <div class="flex items-center gap-2">
    <Input
      type="search"
      placeholder="Filter tasks..."
      bind:value={searchQuery}
      class="max-w-sm"
      oninput={handleFilter}
    />
    <Select
      options={statusOptions}
      bind:value={statusFilter}
      placeholder="Status"
      onchange={handleFilter}
    />
    <Select
      options={priorityOptions}
      bind:value={priorityFilter}
      placeholder="Priority"
      onchange={handleFilter}
    />
    <div class="ml-auto flex items-center gap-1">
      <!-- Lucide: LayoutList -->
      <Button variant="outline" size="sm">
        <span class="text-xs">List</span>
      </Button>
      <!-- Lucide: LayoutGrid -->
      <Button variant="outline" size="sm">
        <span class="text-xs">Board</span>
      </Button>
    </div>
  </div>

  <!-- Task Table -->
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">
            <Checkbox />
          </TableHead>
          <TableHead class="w-24">Task</TableHead>
          <TableHead>Title</TableHead>
          <TableHead class="w-28">Type</TableHead>
          <TableHead class="w-32">Status</TableHead>
          <TableHead class="w-24">Priority</TableHead>
          <TableHead class="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each paginatedTasks as task}
          <TableRow>
            <TableCell>
              <Checkbox
                checked={selectedRows.has(task.id)}
                onchange={() => toggleRowSelection(task.id)}
              />
            </TableCell>
            <TableCell class="font-mono text-xs text-muted-foreground">
              {task.id}
            </TableCell>
            <TableCell class="font-medium">
              {task.title}
            </TableCell>
            <TableCell>
              <Badge variant={getTypeBadgeVariant(task.type)}>
                {task.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <span class={cn('h-2 w-2 rounded-full', getStatusColor(task.status))}></span>
                <span class="text-sm capitalize">{task.status.replace('-', ' ')}</span>
              </div>
            </TableCell>
            <TableCell class="capitalize">
              {task.priority}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                    <!-- Lucide: MoreHorizontal -->
                    <span class="text-xs">...</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Copy ID</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={7} class="text-center text-muted-foreground py-8">
              No tasks found.
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Pagination -->
  <div class="flex items-center justify-between">
    <p class="text-sm text-muted-foreground">
      {selectedRows.size} of {filteredTasks.length} row(s) selected.
    </p>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Rows per page</span>
        <Select
          options={[
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' }
          ]}
          value={String(rowsPerPage)}
          onchange={(e: any) => { rowsPerPage = Number(e.target?.value ?? e.detail?.value ?? rowsPerPage); currentPage = 1; }}
        />
      </div>
      <span class="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onclick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onclick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</div>
