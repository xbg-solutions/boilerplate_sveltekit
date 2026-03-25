<!--
  DashboardBlock03.svelte
  Orders dashboard with icon sidebar, stat cards, tabbed orders table,
  and a right detail panel for viewing individual order info.
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
    Separator,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
  } from '$lib/components/ui';
  import { DynamicIcon } from '$lib/components/ui/icon';

  let className: string = '';
  export { className as class };

  /** Sidebar navigation icons */
  export let sidebarItems: Array<{
    label: string;
    icon: string;
    active?: boolean;
    href?: string;
  }> = [
    { label: 'Dashboard', icon: 'home', active: true },
    { label: 'Orders', icon: 'clipboard-list' },
    { label: 'Products', icon: 'box' },
    { label: 'Customers', icon: 'users' },
    { label: 'Settings', icon: 'settings' }
  ];

  /** Summary stat cards */
  export let stats: Array<{
    title: string;
    value: string;
    change?: string;
  }> = [];

  /** Orders table data */
  export let orders: Array<{
    id: string;
    customer: string;
    type: string;
    status: string;
    date: string;
    amount: string;
  }> = [];

  /** Currently selected order detail */
  export let selectedOrder: {
    id: string;
    date: string;
    items: Array<{ name: string; qty: number; price: string }>;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    shippingAddress?: string;
    billingAddress?: string;
    customerName?: string;
    customerEmail?: string;
    paymentMethod?: string;
  } | null = null;

  /** Active time period tab */
  export let activeTab: string = 'week';

  export let onCreateOrder: (() => void) | undefined = undefined;
  export let onSelectOrder: ((id: string) => void) | undefined = undefined;
  export let onSidebarClick: ((label: string) => void) | undefined = undefined;
  export let onFilter: (() => void) | undefined = undefined;
  export let onExport: (() => void) | undefined = undefined;

  function handleTabChange(e: CustomEvent<{ value: string }>) {
    activeTab = e.detail.value;
  }

  function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status.toLowerCase()) {
      case 'fulfilled': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled':
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  }
</script>

<div class={cn('flex min-h-screen', className)}>
  <!-- Icon Sidebar -->
  <aside class="hidden w-14 flex-col border-r bg-muted/40 sm:flex">
    <nav class="flex flex-col items-center gap-4 py-4">
      {#each sidebarItems as item}
        <button
          class={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground',
            item.active && 'bg-primary text-primary-foreground'
          )}
          title={item.label}
          on:click={() => onSidebarClick?.(item.label)}
        >
          <DynamicIcon name={item.icon} size={20} />
        </button>
      {/each}
    </nav>
  </aside>

  <!-- Main Content -->
  <div class="flex flex-1 flex-col">
    <main class="flex flex-1 gap-4 p-4 md:p-8">
      <!-- Left: Orders -->
      <div class="flex flex-1 flex-col gap-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold tracking-tight">Your Orders</h1>
          <Button on:click={() => onCreateOrder?.()}>Create New Order</Button>
        </div>

        <!-- Stat Cards -->
        <div class="grid gap-4 sm:grid-cols-2">
          {#each stats as stat}
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle class="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              {#if stat.change}
                <CardContent>
                  <p class="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              {/if}
            </Card>
          {/each}
        </div>

        <!-- Tabs + Table -->
        <Tabs value={activeTab} on:change={handleTabChange}>
          <div class="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" on:click={() => onFilter?.()}>
                Filter
              </Button>
              <Button variant="outline" size="sm" on:click={() => onExport?.()}>
                Export
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab}>
            <Card>
              <CardContent class="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead class="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {#each orders as order}
                      <TableRow
                        class="cursor-pointer"
                        on:click={() => onSelectOrder?.(order.id)}
                      >
                        <TableCell class="font-medium">{order.customer}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell class="text-right">{order.amount}</TableCell>
                      </TableRow>
                    {/each}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <!-- Right: Order Detail Panel -->
      {#if selectedOrder}
        <Card class="hidden w-[380px] shrink-0 lg:block">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-lg">Order {selectedOrder.id}</CardTitle>
                <CardDescription>{selectedOrder.date}</CardDescription>
              </div>
              <slot name="order-actions" />
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Line Items -->
            <div class="space-y-2">
              {#each selectedOrder.items as item}
                <div class="flex justify-between text-sm">
                  <span>
                    {item.name}
                    <span class="text-muted-foreground">x {item.qty}</span>
                  </span>
                  <span>{item.price}</span>
                </div>
              {/each}
            </div>

            <Separator />

            <!-- Totals -->
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span>{selectedOrder.subtotal}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span>{selectedOrder.shipping}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax</span>
                <span>{selectedOrder.tax}</span>
              </div>
              <div class="flex justify-between font-medium">
                <span>Total</span>
                <span>{selectedOrder.total}</span>
              </div>
            </div>

            <Separator />

            <!-- Shipping Info -->
            {#if selectedOrder.shippingAddress}
              <div>
                <h4 class="text-sm font-medium mb-1">Shipping Information</h4>
                <p class="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedOrder.shippingAddress}
                </p>
              </div>
            {/if}

            <!-- Billing Info -->
            {#if selectedOrder.billingAddress}
              <div>
                <h4 class="text-sm font-medium mb-1">Billing Information</h4>
                <p class="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedOrder.billingAddress}
                </p>
              </div>
            {/if}

            <Separator />

            <!-- Customer Info -->
            {#if selectedOrder.customerName}
              <div>
                <h4 class="text-sm font-medium mb-1">Customer Information</h4>
                <p class="text-sm">{selectedOrder.customerName}</p>
                {#if selectedOrder.customerEmail}
                  <p class="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                {/if}
              </div>
            {/if}

            <!-- Payment Info -->
            {#if selectedOrder.paymentMethod}
              <div>
                <h4 class="text-sm font-medium mb-1">Payment Information</h4>
                <p class="text-sm text-muted-foreground">{selectedOrder.paymentMethod}</p>
              </div>
            {/if}
          </CardContent>
        </Card>
      {/if}
    </main>
  </div>
</div>
