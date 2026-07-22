<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		searchQuery?: string;
	}

	let { class: className, searchQuery = 'laptop' }: Props = $props();

	let sortBy = $state('relevance');
	let currentPage = $state(1);
	const itemsPerPage = 12;

	const products = Array.from({ length: 28 }, (_, i) => ({
		id: i + 1,
		name: `Product ${i + 1}`,
		price: 49.99 + i * 10,
		rating: 4 + Math.random(),
		reviews: Math.floor(50 + Math.random() * 200),
		sponsored: i % 7 === 0,
	}));

	let totalPages = $derived(Math.ceil(products.length / itemsPerPage));
	let paginatedProducts = $derived(
		products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<!-- Search Bar -->
		<div class="mb-8">
			<div class="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					type="text"
					placeholder="Search..."
					value={searchQuery}
					class="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
				/>
			</div>
		</div>

		<!-- Results Header -->
		<div class="flex items-center justify-between mb-6 pb-6 border-b">
			<div>
				<p class="text-sm text-muted-foreground">Found {products.length} results for <strong>"{searchQuery}"</strong></p>
			</div>

			<!-- Controls -->
			<div class="flex items-center gap-3">
				<!-- Sort -->
				<select
					bind:value={sortBy}
					class="px-3 py-2 text-sm border rounded-lg bg-background text-foreground"
				>
					<option value="relevance">Sort: Relevance</option>
					<option value="price-low">Price: Low to High</option>
					<option value="price-high">Price: High to Low</option>
					<option value="rating">Rating</option>
				</select>

				<!-- Filter -->
				<button class="px-3 py-2 text-sm border rounded-lg bg-background text-foreground hover:bg-gray-50">
					Filter
				</button>
			</div>
		</div>

		<!-- Products Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
			{#each paginatedProducts as product (product.id)}
				<div class="flex flex-col relative">
					<!-- Sponsored Badge -->
					{#if product.sponsored}
						<div class="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
							Sponsored
						</div>
					{/if}

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
					<h3 class="font-semibold text-sm mb-2">{product.name}</h3>

					<!-- Rating -->
					<div class="flex items-center gap-1 mb-2">
						<div class="flex gap-0.5">
							{#each { length: 5 } as _, i}
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
									stroke="currentColor"
									stroke-width="1"
									class={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
								>
									<polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26" />
								</svg>
							{/each}
						</div>
						<span class="text-xs text-muted-foreground">({product.reviews})</span>
					</div>

					<!-- Price -->
					<p class="text-lg font-bold mb-4">${product.price.toFixed(2)}</p>

					<!-- Add to Cart -->
					<Button class="w-full" size="sm">Add to Cart</Button>
				</div>
			{/each}
		</div>

		<!-- Pagination -->
		<div class="flex items-center justify-center gap-2">
			<button
				disabled={currentPage === 1}
				onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				class={cn(
					'px-3 py-2 rounded-lg border transition-colors',
					currentPage === 1
						? 'opacity-50 cursor-not-allowed'
						: 'border-gray-300 text-foreground hover:bg-gray-50'
				)}
			>
				Previous
			</button>

			{#each { length: totalPages } as _, i}
				<button
					onclick={() => (currentPage = i + 1)}
					class={cn(
						'w-10 h-10 rounded-lg border transition-colors',
						currentPage === i + 1
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-gray-300 text-foreground hover:bg-gray-50'
					)}
				>
					{i + 1}
				</button>
			{/each}

			<button
				disabled={currentPage === totalPages}
				onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
				class={cn(
					'px-3 py-2 rounded-lg border transition-colors',
					currentPage === totalPages
						? 'opacity-50 cursor-not-allowed'
						: 'border-gray-300 text-foreground hover:bg-gray-50'
				)}
			>
				Next
			</button>
		</div>
	</div>
</section>
