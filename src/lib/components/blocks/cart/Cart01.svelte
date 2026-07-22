<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	interface CartItem {
		id: number;
		name: string;
		desc: string;
		price: number;
		quantity: number;
		size: string;
	}

	let cartItems = $state<CartItem[]>([
		{
			id: 1,
			name: 'Wireless Headphones',
			desc: 'Premium noise-cancelling',
			price: 129.99,
			quantity: 1,
			size: 'One size'
		},
		{
			id: 2,
			name: 'USB-C Cable',
			desc: '2m braided nylon',
			price: 19.99,
			quantity: 2,
			size: '2 meters'
		},
		{
			id: 3,
			name: 'Phone Case',
			desc: 'Clear protective case',
			price: 24.99,
			quantity: 1,
			size: 'Medium'
		}
	]);

	let promoCode = $state('');

	let subtotal = $derived(
		cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);
	let shipping = $derived(subtotal > 100 ? 0 : 9.99);
	let tax = $derived(subtotal * 0.1);
	let total = $derived(subtotal + shipping + tax);

	function updateQuantity(id: number, delta: number) {
		const item = cartItems.find((i) => i.id === id);
		if (item) {
			item.quantity = Math.max(1, item.quantity + delta);
		}
	}

	function removeItem(id: number) {
		cartItems = cartItems.filter((item) => item.id !== id);
	}

	function TrashIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
	}
</script>

<div class={cn('space-y-8', className)}>
	<div>
		<h1 class="text-3xl font-bold">Shopping Cart</h1>
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Cart Items -->
		<div class="lg:col-span-2">
			<div class="rounded-lg border bg-background overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-6 py-3 text-left text-sm font-semibold">Product</th>
								<th class="px-6 py-3 text-left text-sm font-semibold">Size</th>
								<th class="px-6 py-3 text-left text-sm font-semibold">Price</th>
								<th class="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
								<th class="px-6 py-3 text-right text-sm font-semibold">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#each cartItems as item (item.id)}
								<tr class="hover:bg-muted/30 transition">
									<td class="px-6 py-4">
										<div class="flex gap-4">
											<div class="aspect-square w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
											</div>
											<div>
												<p class="font-medium">{item.name}</p>
												<p class="text-sm text-muted-foreground">{item.desc}</p>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 text-sm">{item.size}</td>
									<td class="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2 border rounded-md w-fit">
											<button
												onclick={() => updateQuantity(item.id, -1)}
												class="px-2 py-1 hover:bg-muted transition"
											>
												−
											</button>
											<span class="px-3 py-1 text-sm">{item.quantity}</span>
											<button
												onclick={() => updateQuantity(item.id, 1)}
												class="px-2 py-1 hover:bg-muted transition"
											>
												+
											</button>
										</div>
									</td>
									<td class="px-6 py-4 text-right">
										<button
											onclick={() => removeItem(item.id)}
											class="p-2 hover:bg-destructive/10 text-destructive rounded transition"
										>
											{@html TrashIcon()}
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Order Summary -->
		<div class="lg:col-span-1">
			<div class="rounded-lg border bg-background p-6 sticky top-6 space-y-6">
				<div>
					<h2 class="text-lg font-semibold mb-4">Order Summary</h2>

					<div class="space-y-3 text-sm">
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
					</div>

					<div class="border-t mt-4 pt-4 flex justify-between font-semibold text-base">
						<span>Total</span>
						<span>${total.toFixed(2)}</span>
					</div>
				</div>

				<div>
					<label for="cart-promo-code" class="block text-sm font-medium mb-2">Promo code</label>
					<input
						id="cart-promo-code"
						type="text"
						bind:value={promoCode}
						placeholder="Enter code"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<Button class="w-full">
					Proceed to checkout
				</Button>
			</div>
		</div>
	</div>
</div>
