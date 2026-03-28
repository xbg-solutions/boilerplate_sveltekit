<!--
  DashboardBlock01.svelte
  Full dashboard with stats cards, transactions table, and recent sales list.
  Features top navigation, 4 stat cards, and a 2-column layout below.
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
    Input,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Avatar
  } from '$lib/components/ui';
  import { DynamicIcon } from '$lib/components/ui/icon';

  let {
    class: className = '',
    navItems = [
      { label: 'Dashboard', href: '#', active: true },
      { label: 'Orders', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Customers', href: '#' },
      { label: 'Analytics', href: '#' }
    ],
    stats = [],
    transactions = [],
    recentSales = [],
    onSearch = undefined,
    onViewAllTransactions = undefined,
    onNavClick = undefined
  }: {
    class?: string;
    /** Navigation items for the top bar */
    navItems?: Array<{ label: string; href: string; active?: boolean }>;
    /** Stat cards data */
    stats?: Array<{
      title: string;
      value: string;
      change: string;
      icon?: string;
    }>;
    /** Transactions table data */
    transactions?: Array<{
      name: string;
      email: string;
      amount: string;
    }>;
    /** Recent sales sidebar data */
    recentSales?: Array<{
      name: string;
      email: string;
      amount: string;
      avatar?: string;
    }>;
    onSearch?: ((query: string) => void) | undefined;
    onViewAllTransactions?: (() => void) | undefined;
    onNavClick?: ((href: string) => void) | undefined;
  } = $props();

  let searchQuery = $state('');

  /** Icon names mapped by keyword */
  const iconMap: Record<string, string> = {
    revenue: 'dollar-sign',
    subscriptions: 'users',
    sales: 'credit-card',
    active: 'activity'
  };

  function getIconName(title: string): string {
    const key = title.toLowerCase();
    for (const [k, v] of Object.entries(iconMap)) {
      if (key.includes(k)) return v;
    }
    return 'circle';
  }
</script>

<div class={cn('flex min-h-screen flex-col', className)}>
  <!-- Top Navigation -->
  <header class="border-b">
    <div class="flex h-16 items-center px-4 gap-4">
      <nav class="flex items-center space-x-4 lg:space-x-6">
        {#each navItems as item}
          <button
            class={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              item.active ? 'text-foreground' : 'text-muted-foreground'
            )}
            onclick={() => onNavClick?.(item.href)}
          >
            {item.label}
          </button>
        {/each}
      </nav>
      <div class="ml-auto flex items-center space-x-4">
        <Input
          type="search"
          placeholder="Search..."
          class="w-[200px] lg:w-[300px]"
          bind:value={searchQuery}
          oninput={() => onSearch?.(searchQuery)}
        />
        <!-- Settings icon -->
        <Button variant="ghost" size="icon">
          <DynamicIcon name="settings" size={20} />
        </Button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 space-y-4 p-4 pt-6 md:p-8">
    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {#each stats as stat}
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <span class="text-muted-foreground" aria-hidden="true">
              <DynamicIcon name={stat.icon || getIconName(stat.title)} size={16} />
            </span>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{stat.value}</div>
            <p class="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Two Column Layout -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <!-- Transactions Table -->
      <Card class="lg:col-span-4">
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Recent transactions from your store.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onclick={() => onViewAllTransactions?.()}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead class="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each transactions as tx}
                <TableRow>
                  <TableCell>
                    <div class="font-medium">{tx.name}</div>
                    <div class="text-sm text-muted-foreground">{tx.email}</div>
                  </TableCell>
                  <TableCell class="text-right font-medium">{tx.amount}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Recent Sales -->
      <Card class="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Your most recent sales activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            {#each recentSales as sale}
              <div class="flex items-center">
                <Avatar
                  src={sale.avatar}
                  fallback={sale.name}
                  size="lg"
                />
                <div class="ml-4 space-y-1">
                  <p class="text-sm font-medium leading-none">{sale.name}</p>
                  <p class="text-sm text-muted-foreground">{sale.email}</p>
                </div>
                <div class="ml-auto font-medium">{sale.amount}</div>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
</div>
