<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let activeFilters = $state<string[]>([]);
	let sortBy = $state('relevance');
	let viewMode = $state<'grid' | 'list'>('grid');

	const filterChips = ['Category', 'Price', 'Rating', 'Brand'];

	const products = Array.from({ length: 12 }, (_, i) => ({
		id: i + 1,
		name: `Product ${i + 1}`,
		price: 49.99 + i * 10,
		rating: 4 + Math.random(),
		reviews: Math.floor(50 + Math.random() * 200),
	}));

	function toggleFilter(filter: string) {
		activeFilters = activeFilters.includes(filter)
			? activeFilters.filter((f) => f !== filter)
			: [...activeFilters, filter];
	}
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<!-- Filter Bar -->
		<div class="mb-8">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- Filter Chips -->
				<div class="flex flex-wrap gap-2">
					{#each filterChips as chip}
						<button
							onclick={() => toggleFilter(chip)}
							class={cn(
								'px-3 py-1.5 text-sm rounded-full border transition-colors',
								activeFilters.includes(chip)
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-background border-gray-200 text-foreground hover:border-gray-300'
							)}
						>
							{chip}
						</button>
					{/each}
				</div>

				<!-- Controls -->
				<div class="flex items-center gap-3">
					<!-- Sort -->
					<select
						bind:value={sortBy}
						class="px-3 py-1.5 text-sm border rounded-lg bg-background text-foreground"
					>
						<option value="relevance">Sort: Relevance</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
						<option value="rating">Rating</option>
					</select>

					<!-- View Toggle -->
					<div class="flex items-center border rounded-lg p-1 bg-background">
						<button
							onclick={() => (viewMode = 'grid')}
							class={cn(
								'px-2 py-1.5 rounded transition-colors',
								viewMode === 'grid'
									? 'bg-gray-100 text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="7" height="7" />
								<rect x="14" y="3" width="7" height="7" />
								<rect x="14" y="14" width="7" height="7" />
								<rect x="3" y="14" width="7" height="7" />
							</svg>
						</button>
						<button
							onclick={() => (viewMode = 'list')}
							class={cn(
								'px-2 py-1.5 rounded transition-colors',
								viewMode === 'list'
									? 'bg-gray-100 text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="8" y1="6" x2="21" y2="6" />
								<line x1="8" y1="12" x2="21" y2="12" />
								<line x1="8" y1="18" x2="21" y2="18" />
								<line x1="3" y1="6" x2="3.01" y2="6" />
								<line x1="3" y1="12" x2="3.01" y2="12" />
								<line x1="3" y1="18" x2="3.01" y2="18" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Products Grid -->
		<div class={cn('gap-6', viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'flex flex-col')}>
			{#each products as product (product.id)}
				<div class={cn('flex flex-col', viewMode === 'list' && 'flex-row gap-4')}>
					<!-- Product Image -->
					<div class={cn('aspect-square bg-gray-100 rounded-lg flex items-center justify-center', viewMode === 'list' && 'w-32 h-32 flex-shrink-0')}>
						<svg
							width={viewMode === 'grid' ? 40 : 32}
							height={viewMode === 'grid' ? 40 : 32}
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
					<div class="flex flex-col flex-grow">
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
				</div>
			{/each}
		</div>
	</div>
</section>
