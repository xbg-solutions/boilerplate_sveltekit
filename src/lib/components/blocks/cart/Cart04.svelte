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
		price: number;
		quantity: number;
	}

	interface ProductCard {
		id: number;
		name: string;
		price: number;
		rating: number;
	}

	let cartItems = $state<CartItem[]>([
		{ id: 1, name: 'Wireless Headphones', price: 129.99, quantity: 1 },
		{ id: 2, name: 'Phone Case', price: 24.99, quantity: 1 }
	]);

	let suggestedProducts = $state<ProductCard[]>([
		{ id: 101, name: 'USB-C Hub', price: 34.99, rating: 4.8 },
		{ id: 102, name: 'Portable Charger', price: 49.99, rating: 4.7 },
		{ id: 103, name: 'Screen Protector', price: 9.99, rating: 4.9 }
	]);

	let subtotal = $derived(
		cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);
	let shipping = $derived(subtotal > 100 ? 0 : 9.99);
	let tax = $derived(subtotal * 0.1);
	let total = $derived(subtotal + shipping + tax);

	function StarIcon(filled: boolean) {
		if (filled) {
			return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 20.16 24.02 12 18.35 3.84 24.02 6.23 16.01 0 10.35 8.91 10.26 12 2"/></polygon></svg>`;
		}
		return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 20.16 24.02 12 18.35 3.84 24.02 6.23 16.01 0 10.35 8.91 10.26 12 2"/></polygon></svg>`;
	}

	function TrashIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
	}

	function removeItem(id: number) {
		cartItems = cartItems.filter((item) => item.id !== id);
	}

	function addToCart(product: ProductCard) {
		const existing = cartItems.find((item) => item.id === product.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			cartItems.push({
				id: product.id,
				name: product.name,
				price: product.price,
				quantity: 1
			});
		}
	}
</script>

<div class={cn('space-y-8', className)}>
	<div>
		<h1 class="text-3xl font-bold">Shopping Cart</h1>
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Left Column: Cart Items + Upsell -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Cart Items -->
			<div class="rounded-lg border bg-background overflow-hidden">
				<div class="p-6 border-b">
					<h2 class="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
				</div>
				<div class="divide-y">
					{#each cartItems as item (item.id)}
						<div class="p-6 flex gap-4 items-start hover:bg-muted/30 transition">
							<div class="aspect-square w-20 h-20 bg-gray-100 rounded flex-shrink-0">
							</div>
							<div class="flex-1 min-w-0">
								<p class="font-medium">{item.name}</p>
								<p class="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
								<p class="font-semibold mt-2">${(item.price * item.quantity).toFixed(2)}</p>
							</div>
							<button
								onclick={() => removeItem(item.id)}
								class="p-2 hover:bg-destructive/10 text-destructive rounded transition flex-shrink-0"
							>
								{@html TrashIcon()}
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Upsell Section -->
			<div class="space-y-4">
				<h2 class="text-lg font-semibold">You might also like</h2>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{#each suggestedProducts as product (product.id)}
						<div class="rounded-lg border bg-background overflow-hidden hover:shadow-md transition">
							<div class="aspect-square w-full bg-gray-100 flex items-center justify-center">
							</div>
							<div class="p-4 space-y-3">
								<p class="font-medium text-sm line-clamp-2">{product.name}</p>
								<div class="flex items-center gap-1">
									{#each { length: 5 } as _, i}
										<div class="text-yellow-400">
											{@html StarIcon(i < Math.floor(product.rating))}
										</div>
									{/each}
									<span class="text-xs text-muted-foreground ml-1">({product.rating})</span>
								</div>
								<div class="flex items-center justify-between">
									<p class="font-semibold">${product.price.toFixed(2)}</p>
									<Button
										size="sm"
										onclick={() => addToCart(product)}
									>
										Add
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right Column: Order Summary -->
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

				<Button class="w-full">
					Proceed to checkout
				</Button>
			</div>
		</div>
	</div>
</div>
