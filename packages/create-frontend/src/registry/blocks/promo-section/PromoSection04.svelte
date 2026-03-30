<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		productName?: string;
		originalPrice?: number;
		salePrice?: number;
	}

	let {
		class: className,
		productName = 'Premium Wireless Headphones',
		originalPrice = 299.99,
		salePrice = 149.99,
	}: Props = $props();

	const features = [
		'Active Noise Cancellation',
		'40-hour battery life',
		'Premium sound quality',
		'Comfortable fit for all-day wear',
	];
</script>

<section class={cn('w-full bg-gray-950 text-white px-4 py-16 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
			<!-- Left Content -->
			<div>
				<!-- Label -->
				<span class="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
					Deal of the Day
				</span>

				<!-- Product Name -->
				<h2 class="text-4xl sm:text-5xl font-bold mb-4">{productName}</h2>

				<!-- Pricing -->
				<div class="mb-6 flex items-center gap-4">
					<span class="text-lg line-through text-gray-400">${originalPrice.toFixed(2)}</span>
					<span class="text-4xl font-bold text-red-500">${salePrice.toFixed(2)}</span>
					<span class="text-lg font-semibold text-green-400">
						Save {Math.round(((originalPrice - salePrice) / originalPrice) * 100)}%
					</span>
				</div>

				<!-- Features List -->
				<ul class="space-y-3 mb-8">
					{#each features as feature}
						<li class="flex items-center gap-3">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="text-green-400 flex-shrink-0"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span>{feature}</span>
						</li>
					{/each}
				</ul>

				<!-- CTA -->
				<div class="flex flex-col sm:flex-row gap-3">
					<Button size="lg" class="bg-red-600 hover:bg-red-700">Add to Cart</Button>
					<Button variant="outline" size="lg" class="border-white text-white hover:bg-white/10">
						View Details
					</Button>
				</div>

				<!-- Limited Time Notice -->
				<p class="text-sm text-gray-400 mt-4">
					Limited stock available. Offer ends in 3 days.
				</p>
			</div>

			<!-- Right - Product Image Placeholder -->
			<div class="flex items-center justify-center">
				<div class="w-full aspect-square bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
					<svg
						width="120"
						height="120"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						class="text-gray-600"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
				</div>
			</div>
		</div>
	</div>
</section>
