<!--
  TasksBlock.svelte
  Task list table with filtering, pagination, and status/priority badges.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from '@xbg.solutions/frontend-core';
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

  let className: string = '';
  export { className as class };

  export let tasks: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string;
  }> = [];

  export let title: string = 'Welcome back!';
  export let description: string = "Here's a list of your tasks for this month!";

  const dispatch = createEventDispatcher<{
    filter: { search: string; status: string; priority: string };
    sort: { column: string; direction: 'asc' | 'desc' };
    pageChange: { page: number };
  }>();

  // Filter state
  let searchQuery = '';
  let statusFilter = '';
  let priorityFilter = '';

  // Pagination state
  let currentPage = 1;
  let rowsPerPage = 10;
  let selectedRows: Set<string> = new Set();

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
  $: filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  $: totalPages = Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage));
  $: paginatedTasks = filteredTasks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  function toggleRowSelection(id: string) {
    if (selectedRows.has(id)) {
      selectedRows.delete(id);
    } else {
      selectedRows.add(id);
    }
    selectedRows = selectedRows;
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
    dispatch('filter', { search: searchQuery, status: statusFilter, priority: priorityFilter });
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      dispatch('pageChange', { page });
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
      on:input={handleFilter}
    />
    <Select
      options={statusOptions}
      bind:value={statusFilter}
      placeholder="Status"
      on:change={handleFilter}
    />
    <Select
      options={priorityOptions}
      bind:value={priorityFilter}
      placeholder="Priority"
      on:change={handleFilter}
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
                on:change={() => toggleRowSelection(task.id)}
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
                <span class={cn('h-2 w-2 rounded-full', getStatusColor(task.status))} />
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
          on:change={(e) => { rowsPerPage = Number(e.detail.value); currentPage = 1; }}
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
          on:click={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          on:click={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</div>
