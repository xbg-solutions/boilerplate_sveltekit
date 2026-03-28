<!--
  DashboardBlock04.svelte
  Orders dashboard variant with a different column layout.
  Features a wider detail panel alongside orders and inline stats.
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
    Badge,
    Separator,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
  } from '$lib/components/ui';

  let {
    class: className = '',
    orders = [],
    selectedOrder = null,
    stats = [],
    onSelectOrder = undefined,
    onCreateOrder = undefined
  }: {
    class?: string;
    /** Orders data */
    orders?: Array<{
      id: string;
      customer: string;
      email: string;
      type: string;
      status: string;
      date: string;
      amount: string;
    }>;
    /** Selected order detail */
    selectedOrder?: {
      id: string;
      date: string;
      items: Array<{ name: string; qty: number; price: string }>;
      subtotal: string;
      shipping: string;
      tax: string;
      total: string;
      customer?: { name: string; email: string; phone?: string };
      paymentMethod?: string;
    } | null;
    /** Summary stats */
    stats?: Array<{
      title: string;
      value: string;
      change?: string;
    }>;
    onSelectOrder?: ((id: string) => void) | undefined;
    onCreateOrder?: (() => void) | undefined;
  } = $props();

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

<div class={cn('flex min-h-screen flex-col', className)}>
  <main class="flex flex-1 gap-4 p-4 md:p-8">
    <!-- Left Column: Stats + Table -->
    <div class="flex flex-1 flex-col gap-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Orders</h1>
          <p class="text-muted-foreground">Manage and track your orders.</p>
        </div>
        <Button onclick={() => onCreateOrder?.()}>Create Order</Button>
      </div>

      <!-- Stats Row -->
      {#if stats.length > 0}
        <div class="grid gap-4 sm:grid-cols-3">
          {#each stats as stat}
            <Card>
              <CardHeader class="pb-2">
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle class="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
              {#if stat.change}
                <CardContent>
                  <p class="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              {/if}
            </Card>
          {/each}
        </div>
      {/if}

      <!-- Orders Table -->
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
                  onclick={() => onSelectOrder?.(order.id)}
                >
                  <TableCell>
                    <div class="font-medium">{order.customer}</div>
                    <div class="text-sm text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell class="text-right font-medium">{order.amount}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <!-- Right Column: Order Detail -->
    {#if selectedOrder}
      <Card class="hidden w-[420px] shrink-0 lg:block">
        <CardHeader>
          <CardTitle>Order {selectedOrder.id}</CardTitle>
          <CardDescription>Placed on {selectedOrder.date}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Line Items -->
          <div>
            <h4 class="text-sm font-medium mb-2">Items</h4>
            <div class="space-y-2">
              {#each selectedOrder.items as item}
                <div class="flex justify-between text-sm">
                  <span>
                    {item.name}
                    <span class="text-muted-foreground">x{item.qty}</span>
                  </span>
                  <span>{item.price}</span>
                </div>
              {/each}
            </div>
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
            <Separator />
            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span>{selectedOrder.total}</span>
            </div>
          </div>

          <Separator />

          <!-- Customer Info -->
          {#if selectedOrder.customer}
            <div>
              <h4 class="text-sm font-medium mb-1">Customer</h4>
              <p class="text-sm">{selectedOrder.customer.name}</p>
              <p class="text-sm text-muted-foreground">{selectedOrder.customer.email}</p>
              {#if selectedOrder.customer.phone}
                <p class="text-sm text-muted-foreground">{selectedOrder.customer.phone}</p>
              {/if}
            </div>
          {/if}

          <!-- Payment -->
          {#if selectedOrder.paymentMethod}
            <div>
              <h4 class="text-sm font-medium mb-1">Payment</h4>
              <p class="text-sm text-muted-foreground">{selectedOrder.paymentMethod}</p>
            </div>
          {/if}
        </CardContent>
      </Card>
    {/if}
  </main>
</div>
