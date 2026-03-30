<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	interface OrderItem {
		id: number;
		name: string;
		price: number;
		quantity: number;
	}

	const orderNumber = 'ORD-2024-001234';
	const orderDate = 'March 28, 2026';
	const status = 'Delivered';

	let orderItems = $state<OrderItem[]>([
		{ id: 1, name: 'Wireless Headphones', price: 129.99, quantity: 1 },
		{ id: 2, name: 'Phone Case', price: 24.99, quantity: 1 },
		{ id: 3, name: 'USB-C Cable', price: 19.99, quantity: 1 }
	]);

	let subtotal = $derived(
		orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);
	let shipping = $derived(0);
	let tax = $derived(subtotal * 0.1);
	let total = $derived(subtotal + shipping + tax);

	function ChevronLeftIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
	}
</script>

<div class={cn('space-y-8', className)}>
	<!-- Back Button -->
	<button class="flex items-center gap-2 text-primary hover:underline font-medium mb-4">
		{@html ChevronLeftIcon()}
		Back to orders
	</button>

	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold">Order {orderNumber}</h1>
			<p class="text-muted-foreground mt-2">{orderDate}</p>
		</div>
		<span class="px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
			{status}
		</span>
	</div>

	<!-- Main Content -->
	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Left: Order Items -->
		<div class="lg:col-span-2">
			<div class="rounded-lg border bg-background p-6">
				<h2 class="text-lg font-semibold mb-4">Order items</h2>
				<div class="space-y-4">
					{#each orderItems as item (item.id)}
						<div class="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition">
							<div class="aspect-square w-20 h-20 bg-gray-100 rounded flex-shrink-0">
							</div>
							<div class="flex-1 min-w-0">
								<p class="font-medium">{item.name}</p>
								<p class="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
								<p class="font-semibold mt-2">${(item.price * item.quantity).toFixed(2)}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right: Sidebar -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Shipping Address -->
			<div class="rounded-lg border bg-background p-6">
				<h3 class="font-semibold mb-3">Shipping address</h3>
				<div class="space-y-1 text-sm text-muted-foreground">
					<p class="font-medium text-foreground">John Doe</p>
					<p>123 Main Street</p>
					<p>New York, NY 10001</p>
					<p>United States</p>
				</div>
			</div>

			<!-- Payment Method -->
			<div class="rounded-lg border bg-background p-6">
				<h3 class="font-semibold mb-3">Payment method</h3>
				<div class="space-y-1 text-sm text-muted-foreground">
					<p class="font-medium text-foreground">Visa ending in 4242</p>
					<p>Expires 05/2025</p>
				</div>
			</div>

			<!-- Order Summary -->
			<div class="rounded-lg border bg-background p-6">
				<h3 class="font-semibold mb-4">Order summary</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Subtotal</span>
						<span>${subtotal.toFixed(2)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Shipping</span>
						<span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Tax</span>
						<span>${tax.toFixed(2)}</span>
					</div>
					<div class="border-t pt-2 mt-2 flex justify-between font-semibold">
						<span>Total</span>
						<span>${total.toFixed(2)}</span>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<Button class="w-full">
				Download invoice
			</Button>
		</div>
	</div>
</div>
