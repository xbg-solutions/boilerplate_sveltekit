<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	let email = $state('customer@example.com');
	let firstName = $state('John');
	let lastName = $state('Doe');
	let address = $state('123 Main Street');
	let city = $state('New York');
	let stateRegion = $state('NY');
	let zip = $state('10001');
	let country = $state('United States');
	let shippingMethod = $state('standard');

	interface OrderItem {
		id: number;
		name: string;
		price: number;
		quantity: number;
	}

	let orderItems = $state<OrderItem[]>([
		{ id: 1, name: 'Wireless Headphones', price: 129.99, quantity: 1 },
		{ id: 2, name: 'Phone Case', price: 24.99, quantity: 1 }
	]);

	let subtotal = $derived(
		orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

	let shippingCost = $derived(shippingMethod === 'express' ? 24.99 : 9.99);
	let tax = $derived(subtotal * 0.1);
	let total = $derived(subtotal + shippingCost + tax);

	function GlobeIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 1 10 4M12 22a14.5 14.5 0 0 1-10-4M2 12h20M12 2a14.5 14.5 0 0 0 0 20M12 22a14.5 14.5 0 0 0 0-20"/></svg>`;
	}
</script>

<div class={cn('space-y-8', className)}>
	<div>
		<h1 class="text-3xl font-bold">Checkout</h1>
		<p class="text-muted-foreground mt-2">Complete your purchase</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Left Column: Forms -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Contact Info -->
			<div class="rounded-lg border bg-background p-6">
				<h2 class="text-lg font-semibold mb-4">Contact information</h2>
				<div>
					<label for="checkout-email" class="block text-sm font-medium mb-2">Email address</label>
					<input
						id="checkout-email"
						type="email"
						bind:value={email}
						placeholder="email@example.com"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>

			<!-- Delivery Address -->
			<div class="rounded-lg border bg-background p-6">
				<h2 class="text-lg font-semibold mb-4">Delivery address</h2>
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="checkout-first-name" class="block text-sm font-medium mb-2">First name</label>
							<input
								id="checkout-first-name"
								type="text"
								bind:value={firstName}
								placeholder="John"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout-last-name" class="block text-sm font-medium mb-2">Last name</label>
							<input
								id="checkout-last-name"
								type="text"
								bind:value={lastName}
								placeholder="Doe"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
					</div>

					<div>
						<label for="checkout-address" class="block text-sm font-medium mb-2">Street address</label>
						<input
							id="checkout-address"
							type="text"
							bind:value={address}
							placeholder="Street address"
							class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="checkout-city" class="block text-sm font-medium mb-2">City</label>
							<input
								id="checkout-city"
								type="text"
								bind:value={city}
								placeholder="City"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout-state" class="block text-sm font-medium mb-2">State</label>
							<input
								id="checkout-state"
								type="text"
								bind:value={stateRegion}
								placeholder="State"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="checkout-zip" class="block text-sm font-medium mb-2">Zip code</label>
							<input
								id="checkout-zip"
								type="text"
								bind:value={zip}
								placeholder="Zip code"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout-country" class="block text-sm font-medium mb-2">Country</label>
							<div class="relative">
								<select
									id="checkout-country"
									bind:value={country}
									class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
								>
									<option>United States</option>
									<option>Canada</option>
									<option>United Kingdom</option>
									<option>Australia</option>
								</select>
								<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									{@html GlobeIcon()}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Shipping Method -->
			<div class="rounded-lg border bg-background p-6">
				<h2 class="text-lg font-semibold mb-4">Shipping method</h2>
				<div class="space-y-3">
					<label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
						class:bg-muted={shippingMethod === 'standard'}
					>
						<input
							type="radio"
							bind:group={shippingMethod}
							value="standard"
							class="w-4 h-4"
						/>
						<div class="flex-1">
							<p class="font-medium">Standard Shipping</p>
							<p class="text-sm text-muted-foreground">Delivery in 5-7 business days</p>
						</div>
						<span class="font-semibold">$9.99</span>
					</label>

					<label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
						class:bg-muted={shippingMethod === 'express'}
					>
						<input
							type="radio"
							bind:group={shippingMethod}
							value="express"
							class="w-4 h-4"
						/>
						<div class="flex-1">
							<p class="font-medium">Express Shipping</p>
							<p class="text-sm text-muted-foreground">Delivery in 1-2 business days</p>
						</div>
						<span class="font-semibold">$24.99</span>
					</label>
				</div>
			</div>
		</div>

		<!-- Right Column: Order Summary -->
		<div class="lg:col-span-1">
			<div class="rounded-lg border bg-background p-6 sticky top-6 space-y-6">
				<div>
					<h2 class="text-lg font-semibold mb-4">Order summary</h2>

					<div class="space-y-3 mb-4">
						{#each orderItems as item (item.id)}
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">{item.name} x {item.quantity}</span>
								<span>${(item.price * item.quantity).toFixed(2)}</span>
							</div>
						{/each}
					</div>

					<div class="border-t pt-4 space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Subtotal</span>
							<span>${subtotal.toFixed(2)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Shipping</span>
							<span>${shippingCost.toFixed(2)}</span>
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
					Place order
				</Button>
			</div>
		</div>
	</div>
</div>
