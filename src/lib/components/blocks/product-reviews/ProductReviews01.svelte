<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		overallRating?: number;
	}

	let { class: className, overallRating = 4.5 }: Props = $props();

	const ratingDistribution = [
		{ stars: 5, count: 1250, percentage: 62.5 },
		{ stars: 4, count: 500, percentage: 25 },
		{ stars: 3, count: 150, percentage: 7.5 },
		{ stars: 2, count: 50, percentage: 2.5 },
		{ stars: 1, count: 50, percentage: 2.5 },
	];

	const reviews = [
		{
			id: 1,
			author: 'John Doe',
			date: 'Mar 15, 2024',
			rating: 5,
			title: 'Excellent product!',
			text: 'Really impressed with the quality and build. Highly recommend to anyone considering this product.',
		},
		{
			id: 2,
			author: 'Sarah Smith',
			date: 'Mar 12, 2024',
			rating: 4,
			title: 'Great value',
			text: 'Good quality at a reasonable price. Shipping was fast and packaging was secure.',
		},
		{
			id: 3,
			author: 'Mike Johnson',
			date: 'Mar 10, 2024',
			rating: 5,
			title: 'Best purchase ever',
			text: 'Exceeded my expectations. Customer service was helpful and responsive.',
		},
	];
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			<!-- Rating Summary -->
			<div>
				<div class="mb-8">
					<div class="flex items-start gap-4">
						<div>
							<p class="text-6xl font-bold">{overallRating}</p>
							<div class="flex gap-0.5 my-2">
								{#each { length: 5 } as _, i}
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill={i < Math.floor(overallRating) ? 'currentColor' : 'none'}
										stroke="currentColor"
										stroke-width="1"
										class={i < Math.floor(overallRating) ? 'text-yellow-400' : 'text-gray-300'}
									>
										<polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26" />
									</svg>
								{/each}
							</div>
							<p class="text-sm text-muted-foreground">Based on 2,000 reviews</p>
						</div>
					</div>
				</div>

				<!-- Rating Bars -->
				<div class="space-y-3">
					{#each ratingDistribution as distribution}
						<div class="flex items-center gap-3">
							<span class="text-sm text-muted-foreground w-12">{distribution.stars}★</span>
							<div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									class="h-full bg-yellow-400"
									style="width: {distribution.percentage}%"
								/>
							</div>
							<span class="text-sm text-muted-foreground w-12 text-right">{distribution.percentage}%</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Reviews List -->
			<div class="space-y-6">
				<h3 class="text-xl font-semibold">Recent Reviews</h3>
				{#each reviews as review (review.id)}
					<div class="pb-6 border-b last:border-b-0">
						<div class="flex items-start gap-3 mb-2">
							<!-- Avatar -->
							<div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-600">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
									<circle cx="12" cy="7" r="4" />
								</svg>
							</div>

							<!-- Review Header -->
							<div class="flex-1">
								<div class="flex items-center justify-between mb-1">
									<h4 class="font-semibold text-sm">{review.author}</h4>
									<span class="text-xs text-muted-foreground">{review.date}</span>
								</div>

								<!-- Rating -->
								<div class="flex gap-0.5 mb-2">
									{#each { length: 5 } as _, i}
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill={i < review.rating ? 'currentColor' : 'none'}
											stroke="currentColor"
											stroke-width="1"
											class={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
										>
											<polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26" />
										</svg>
									{/each}
								</div>
							</div>
						</div>

						<!-- Review Content -->
						<h5 class="font-semibold text-sm mb-2">{review.title}</h5>
						<p class="text-sm text-muted-foreground mb-3">{review.text}</p>

						<!-- Helpful Button -->
						<button class="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="20 12 20 22 4 22 4 12" />
								<polyline points="2 7 12 2 22 7" />
							</svg>
							Helpful
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- View All Reviews Button -->
		<div class="mt-12 text-center">
			<Button variant="outline" size="lg">View All Reviews</Button>
		</div>
	</div>
</section>
