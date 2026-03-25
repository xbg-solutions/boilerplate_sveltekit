<!--
  DashboardBlock06.svelte
  Table-focused dashboard with pagination.
  Minimal stats header, prominent data table with page controls.
-->
<script lang="ts">
  import { cn } from '@xbg.solutions/frontend-core';
  import {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
    Badge,
    Input,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
  } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  /** Table rows */
  export let rows: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    type: string;
    amount: string;
    date: string;
  }> = [];

  /** Column headers */
  export let columns: string[] = ['Customer', 'Type', 'Status', 'Date', 'Amount'];

  /** Pagination state */
  export let currentPage: number = 1;
  export let totalPages: number = 1;
  export let totalItems: number = 0;
  export let pageSize: number = 10;

  export let title: string = 'Transactions';
  export let description: string = 'A list of all transactions.';

  export let onPageChange: ((page: number) => void) | undefined = undefined;
  export let onSearch: ((query: string) => void) | undefined = undefined;
  export let onRowClick: ((id: string) => void) | undefined = undefined;
  export let onExport: (() => void) | undefined = undefined;

  let searchQuery = '';

  $: startItem = (currentPage - 1) * pageSize + 1;
  $: endItem = Math.min(currentPage * pageSize, totalItems);

  function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status.toLowerCase()) {
      case 'fulfilled':
      case 'completed':
      case 'active': return 'default';
      case 'pending':
      case 'processing': return 'secondary';
      case 'cancelled':
      case 'failed':
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  }
</script>

<div class={cn('space-y-4 p-4 md:p-8', className)}>
  <!-- Header -->
  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{title}</h1>
      <p class="text-muted-foreground">{description}</p>
    </div>
    <div class="flex items-center gap-2">
      <Input
        type="search"
        placeholder="Search..."
        class="w-[200px]"
        bind:value={searchQuery}
        on:input={() => onSearch?.(searchQuery)}
      />
      <Button variant="outline" on:click={() => onExport?.()}>
        Export
      </Button>
    </div>
  </div>

  <!-- Table Card -->
  <Card>
    <CardContent class="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            {#each columns as col}
              <TableHead class={col === 'Amount' ? 'text-right' : ''}>
                {col}
              </TableHead>
            {/each}
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each rows as row}
            <TableRow
              class="cursor-pointer"
              on:click={() => onRowClick?.(row.id)}
            >
              <TableCell>
                <div class="font-medium">{row.name}</div>
                <div class="text-sm text-muted-foreground">{row.email}</div>
              </TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(row.status)}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">{row.date}</TableCell>
              <TableCell class="text-right font-medium">{row.amount}</TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>

    <!-- Pagination Footer -->
    <CardFooter class="flex items-center justify-between border-t px-6 py-4">
      <p class="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems}
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          on:click={() => onPageChange?.(currentPage - 1)}
        >
          Previous
        </Button>
        <span class="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          on:click={() => onPageChange?.(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </CardFooter>
  </Card>
</div>
