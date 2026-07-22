<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	type OrderStatus = 'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

	interface Order {
		id: string;
		orderNumber: string;
		date: string;
		items: number;
		total: number;
		status: string;
		statusType: 'processing' | 'shipped' | 'delivered' | 'cancelled';
	}

	let activeFilter = $state<OrderStatus>('all');
	let currentPage = $state(1);

	let allOrders = $state<Order[]>([
		{
			id: '1',
			orderNumber: 'ORD-2024-001234',
			date: 'March 28, 2026',
			items: 3,
			total: 154.99,
			status: 'Delivered',
			statusType: 'delivered'
		},
		{
			id: '2',
			orderNumber: 'ORD-2024-001233',
			date: 'March 22, 2026',
			items: 2,
			total: 89.98,
			status: 'Shipped',
			statusType: 'shipped'
		},
		{
			id: '3',
			orderNumber: 'ORD-2024-001232',
			date: 'March 15, 2026',
			items: 1,
			total: 129.99,
			status: 'Processing',
			statusType: 'processing'
		},
		{
			id: '4',
			orderNumber: 'ORD-2024-001231',
			date: 'March 10, 2026',
			items: 4,
			total: 249.96,
			status: 'Delivered',
			statusType: 'delivered'
		},
		{
			id: '5',
			orderNumber: 'ORD-2024-001230',
			date: 'February 28, 2026',
			items: 2,
			total: 59.98,
			status: 'Cancelled',
			statusType: 'cancelled'
		}
	]);

	let filteredOrders = $derived.by(() => {
		if (activeFilter === 'all') {
			return allOrders;
		}
		return allOrders.filter((order) => order.statusType === activeFilter);
	});

	let paginatedOrders = $derived.by(() => {
		const itemsPerPage = 5;
		const startIdx = (currentPage - 1) * itemsPerPage;
		return filteredOrders.slice(startIdx, startIdx + itemsPerPage);
	});

	let totalPages = $derived(Math.ceil(filteredOrders.length / 5));

	function getStatusColor(status: string) {
		switch (status) {
			case 'delivered':
				return 'bg-green-100 text-green-800';
			case 'shipped':
				return 'bg-blue-100 text-blue-800';
			case 'processing':
				return 'bg-yellow-100 text-yellow-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function ChevronRightIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
	}
</script>

<div class={cn('space-y-8', className)}>
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold">Your Orders</h1>
		<p class="text-muted-foreground mt-2">Track and manage all your purchases</p>
	</div>

	<!-- Filter Tabs -->
	<div class="flex gap-2 border-b">
		{#each ['all', 'processing', 'shipped', 'delivered', 'cancelled'] as filter}
			<button
				onclick={() => {
					activeFilter = filter as OrderStatus;
					currentPage = 1;
				}}
				class={cn(
					'px-4 py-2 border-b-2 transition font-medium text-sm',
					activeFilter === filter
						? 'border-black text-black'
						: 'border-transparent text-muted-foreground hover:text-foreground'
				)}
			>
				{filter.charAt(0).toUpperCase() + filter.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Orders Table -->
	<div class="rounded-lg border bg-background overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b bg-muted/50">
					<tr>
						<th class="px-6 py-3 text-left text-sm font-semibold">Order</th>
						<th class="px-6 py-3 text-left text-sm font-semibold">Date</th>
						<th class="px-6 py-3 text-left text-sm font-semibold">Items</th>
						<th class="px-6 py-3 text-left text-sm font-semibold">Total</th>
						<th class="px-6 py-3 text-left text-sm font-semibold">Status</th>
						<th class="px-6 py-3 text-right text-sm font-semibold">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each paginatedOrders as order (order.id)}
						<tr class="hover:bg-muted/30 transition">
							<td class="px-6 py-4">
								<p class="font-mono font-semibold text-sm">{order.orderNumber}</p>
							</td>
							<td class="px-6 py-4 text-sm">{order.date}</td>
							<td class="px-6 py-4 text-sm">{order.items} item{order.items !== 1 ? 's' : ''}</td>
							<td class="px-6 py-4 font-semibold">${order.total.toFixed(2)}</td>
							<td class="px-6 py-4">
								<span
									class={cn(
										'px-3 py-1 rounded-full text-xs font-semibold',
										getStatusColor(order.statusType)
									)}
								>
									{order.status}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<button class="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
									View details
									<span>{@html ChevronRightIcon()}</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing page {currentPage} of {totalPages}
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
</div>
