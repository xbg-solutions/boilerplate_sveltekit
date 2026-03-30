<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		categoryName?: string;
	}

	let { class: className, categoryName = 'Electronics' }: Props = $props();

	let selectedCategories = $state<string[]>([]);
	let selectedBrands = $state<string[]>([]);
	let sortBy = $state('relevance');

	const categories = ['Laptops', 'Phones', 'Tablets', 'Accessories', 'Smart Devices'];
	const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D'];

	const products = Array.from({ length: 12 }, (_, i) => ({
		id: i + 1,
		name: `Product ${i + 1}`,
		price: 49.99 + i * 10,
		rating: 4 + Math.random(),
		reviews: Math.floor(50 + Math.random() * 200),
	}));

	function toggleCategory(category: string) {
		selectedCategories = selectedCategories.includes(category)
			? selectedCategories.filter((c) => c !== category)
			: [...selectedCategories, category];
	}

	function toggleBrand(brand: string) {
		selectedBrands = selectedBrands.includes(brand)
			? selectedBrands.filter((b) => b !== brand)
			: [...selectedBrands, brand];
	}
</script>

<section class={cn('w-full bg-background', className)}>
	<!-- Category Banner -->
	<div class="bg-gray-950 text-white px-4 py-16 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<!-- Breadcrumb -->
			<div class="text-sm text-gray-400 mb-4">
				<a href="#" class="hover:text-gray-300">Home</a>
				<span class="mx-2">/</span>
				<span>{categoryName}</span>
			</div>

			<!-- Category Title -->
			<h1 class="text-4xl sm:text-5xl font-bold">{categoryName}</h1>
			<p class="mt-2 text-lg text-gray-300">Explore our collection of premium {categoryName.toLowerCase()} products</p>
		</div>
	</div>

	<!-- Content -->
	<div class="px-4 py-12 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
				<!-- Sidebar Filters -->
				<div class="space-y-6">
					<!-- Categories -->
					<div>
						<h3 class="font-semibold text-sm mb-3">Subcategories</h3>
						<div class="space-y-2">
							{#each categories as category}
								<label class="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={selectedCategories.includes(category)}
										onchange={() => toggleCategory(category)}
										class="w-4 h-4 rounded border-gray-300"
									/>
									<span class="text-sm text-foreground">{category}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Brands -->
					<div>
						<h3 class="font-semibold text-sm mb-3">Brands</h3>
						<div class="space-y-2">
							{#each brands as brand}
								<label class="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={selectedBrands.includes(brand)}
										onchange={() => toggleBrand(brand)}
										class="w-4 h-4 rounded border-gray-300"
									/>
									<span class="text-sm text-foreground">{brand}</span>
								</label>
							{/each}
						</div>
					</div>
				</div>

				<!-- Products Grid -->
				<div class="lg:col-span-3">
					<!-- Sort Bar -->
					<div class="flex items-center justify-between mb-6 pb-6 border-b">
						<p class="text-sm text-muted-foreground">42 products</p>
						<select
							bind:value={sortBy}
							class="px-3 py-2 text-sm border rounded-lg bg-background text-foreground"
						>
							<option value="relevance">Sort by: Relevance</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
							<option value="rating">Highest Rated</option>
							<option value="newest">Newest</option>
						</select>
					</div>

					<!-- Products Grid -->
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each products as product (product.id)}
							<div class="flex flex-col">
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
				</div>
			</div>
		</div>
	</div>
</section>
