<!--
  AccountSection01.svelte
  Account dashboard: left sidebar with avatar, name, email, nav links (Orders, Profile, Addresses, Payment, Wishlist, Sign out).
  Right main: "Recent Orders" table (last 3) + "Account Summary" stats (Total orders, Wishlist items, Saved addresses).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const user = {
    name: 'Sarah Anderson',
    email: 'sarah.anderson@example.com',
    initials: 'SA'
  };

  const recentOrders = [
    { id: '#12345', date: 'Mar 28, 2026', total: '$156.50', status: 'Delivered' },
    { id: '#12321', date: 'Mar 15, 2026', total: '$89.99', status: 'Delivered' },
    { id: '#12287', date: 'Mar 5, 2026', total: '$245.00', status: 'Delivered' }
  ];

  const stats = [
    { label: 'Total Orders', value: '24' },
    { label: 'Wishlist Items', value: '8' },
    { label: 'Saved Addresses', value: '3' }
  ];
</script>

<div class={cn('w-full bg-gray-50 py-8', className)}>
  <div class="mx-auto max-w-7xl px-4">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
      <!-- Left sidebar -->
      <div class="md:col-span-1">
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <!-- Avatar and info -->
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">{user.initials}</div>
            <div>
              <p class="font-medium text-gray-900">{user.name}</p>
              <p class="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <hr class="mb-6" />

          <!-- Navigation -->
          <nav class="space-y-1">
            <a href="#" class="block rounded-md px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100">Orders</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Addresses</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Payment Methods</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</a>
          </nav>

          <hr class="my-6" />

          <button type="button" class="w-full rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">Sign out</button>
        </div>
      </div>

      <!-- Right main content -->
      <div class="md:col-span-3 space-y-6">
        <!-- Account Summary Stats -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {#each stats as stat}
            <div class="rounded-lg bg-white p-6 shadow-sm">
              <p class="text-sm text-gray-500">{stat.label}</p>
              <p class="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          {/each}
        </div>

        <!-- Recent Orders -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left text-sm font-medium text-gray-500 py-3">Order ID</th>
                  <th class="text-left text-sm font-medium text-gray-500 py-3">Date</th>
                  <th class="text-left text-sm font-medium text-gray-500 py-3">Total</th>
                  <th class="text-left text-sm font-medium text-gray-500 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {#each recentOrders as order}
                  <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 text-sm font-medium text-gray-900">{order.id}</td>
                    <td class="py-3 text-sm text-gray-600">{order.date}</td>
                    <td class="py-3 text-sm font-medium text-gray-900">{order.total}</td>
                    <td class="py-3 text-sm">
                      <span class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <a href="#" class="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">View all orders</a>
        </div>
      </div>
    </div>
  </div>
</div>
