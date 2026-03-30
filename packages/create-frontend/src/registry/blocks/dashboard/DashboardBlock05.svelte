<!--
  DashboardBlock05.svelte
  Compact stats dashboard with a data table.
  Features inline stat badges and a clean table layout.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    Badge,
    Input,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
  } from '$lib/components/ui';

  let {
    class: className = '',
    stats = [],
    rows = [],
    columns = ['Name', 'Status', 'Amount', 'Date'],
    title = 'Dashboard',
    description = '',
    onSearch = undefined,
    onRowClick = undefined
  }: {
    class?: string;
    /** Compact stat items */
    stats?: Array<{
      title: string;
      value: string;
      change?: string;
      trend?: 'up' | 'down' | 'neutral';
    }>;
    /** Table data */
    rows?: Array<{
      id: string;
      name: string;
      email: string;
      status: string;
      amount: string;
      date: string;
    }>;
    /** Table column headers */
    columns?: string[];
    title?: string;
    description?: string;
    onSearch?: ((query: string) => void) | undefined;
    onRowClick?: ((id: string) => void) | undefined;
  } = $props();

  let searchQuery = $state('');

  function trendColor(trend?: string): string {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  }

  function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status.toLowerCase()) {
      case 'active':
      case 'fulfilled': return 'default';
      case 'pending':
      case 'processing': return 'secondary';
      case 'cancelled':
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  }
</script>

<div class={cn('space-y-4 p-4 md:p-8', className)}>
  <!-- Header -->
  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{title}</h1>
      {#if description}
        <p class="text-muted-foreground">{description}</p>
      {/if}
    </div>
    <Input
      type="search"
      placeholder="Search..."
      class="w-full md:w-[250px]"
      bind:value={searchQuery}
      oninput={() => onSearch?.(searchQuery)}
    />
  </div>

  <!-- Compact Stats -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat}
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">{stat.title}</p>
            {#if stat.change}
              <span class={cn('text-xs font-medium', trendColor(stat.trend))}>
                {stat.change}
              </span>
            {/if}
          </div>
          <p class="text-2xl font-bold mt-1">{stat.value}</p>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Data Table -->
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {#if description}
        <CardDescription>{description}</CardDescription>
      {/if}
    </CardHeader>
    <CardContent class="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            {#each columns as col}
              <TableHead>{col}</TableHead>
            {/each}
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each rows as row}
            <TableRow
              class="cursor-pointer"
              onclick={() => onRowClick?.(row.id)}
            >
              <TableCell>
                <div class="font-medium">{row.name}</div>
                <div class="text-sm text-muted-foreground">{row.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(row.status)}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell class="font-medium">{row.amount}</TableCell>
              <TableCell class="text-muted-foreground">{row.date}</TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
