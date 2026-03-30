<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let savedItems = $state([
		{ id: 1, name: 'Product 1', price: 49.99, rating: 4.5 },
		{ id: 2, name: 'Product 2', price: 79.99, rating: 4.8 },
		{ id: 3, name: 'Product 3', price: 129.99, rating: 4.2 },
		{ id: 4, name: 'Product 4', price: 59.99, rating: 4.7 },
		{ id: 5, name: 'Product 5', price: 89.99, rating: 4.3 },
		{ id: 6, name: 'Product 6', price: 99.99, rating: 4.6 },
		{ id: 7, name: 'Product 7', price: 69.99, rating: 4.4 },
		{ id: 8, name: 'Product 8', price: 149.99, rating: 4.9 },
		{ id: 9, name: 'Product 9', price: 39.99, rating: 4.1 },
		{ id: 10, name: 'Product 10', price: 109.99, rating: 4.5 },
		{ id: 11, name: 'Product 11', price: 119.99, rating: 4.8 },
		{ id: 12, name: 'Product 12', price: 139.99, rating: 4.7 },
	]);

	function removeItem(id: number) {
		savedItems = savedItems.filter((item) => item.id !== id);
	}
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<!-- Page Header -->
		<div class="mb-12">
			<h1 class="text-4xl sm:text-5xl font-bold">Saved Items</h1>
			<p class="mt-2 text-muted-foreground">
				{savedItems.length} item{savedItems.length !== 1 ? 's' : ''} in your wishlist
			</p>
		</div>

		{#if savedItems.length > 0}
			<!-- Products Grid -->
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each savedItems as item (item.id)}
					<div class="flex flex-col relative">
						<!-- Remove Button -->
						<button
							onclick={() => removeItem(item.id)}
							class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors z-10"
							aria-label="Remove from wishlist"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>

						<!-- Product Image -->
						<div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1"
								class="text-gray-400"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<circle cx="8.5" cy="8.5" r="1.5" />
								<polyline points="21 15 16 10 5 21" />
							</svg>
						</div>

						<!-- Product Info -->
						<h3 class="font-semibold text-sm mb-2">{item.name}</h3>

						<!-- Rating -->
						<div class="flex items-center gap-1 mb-2">
							<div class="flex gap-0.5">
								{#each { length: 5 } as _, i}
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill={i < Math.floor(item.rating) ? 'currentColor' : 'none'}
										stroke="currentColor"
										stroke-width="1"
										class={i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}
									>
										<polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26" />
									</svg>
								{/each}
							</div>
							<span class="text-xs text-muted-foreground">({Math.floor(Math.random() * 200) + 50})</span>
						</div>

						<!-- Price -->
						<p class="text-lg font-bold mb-4">${item.price.toFixed(2)}</p>

						<!-- Add to Cart -->
						<Button class="w-full" size="sm">Add to Cart</Button>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-20">
				<svg
					width="64"
					height="64"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1"
					class="mx-auto mb-4 text-muted-foreground"
				>
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
				<h2 class="text-xl font-semibold mb-2">No saved items yet</h2>
				<p class="text-muted-foreground mb-6">Start saving your favorite products to your wishlist</p>
				<Button>Continue Shopping</Button>
			</div>
		{/if}
	</div>
</section>
