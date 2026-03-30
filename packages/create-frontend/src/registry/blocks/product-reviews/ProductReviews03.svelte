<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	const reviews = [
		{
			id: 1,
			author: 'John Doe',
			date: 'Mar 15, 2024',
			rating: 5,
			title: 'Perfect! Great quality',
			text: 'This product exceeded all my expectations. The build quality is outstanding and it arrived in perfect condition.',
			images: [1, 2, 3],
		},
		{
			id: 2,
			author: 'Sarah Smith',
			date: 'Mar 12, 2024',
			rating: 4,
			title: 'Good value for money',
			text: 'Solid product at a reasonable price. Does exactly what it claims to do.',
			images: [1, 2],
		},
		{
			id: 3,
			author: 'Mike Johnson',
			date: 'Mar 10, 2024',
			rating: 5,
			title: 'Best purchase ever',
			text: 'Absolutely love this! The quality is incredible and customer service was super helpful.',
			images: [1, 2, 3, 4],
		},
	];
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8">
			<h2 class="text-3xl font-bold">Reviews with Photos</h2>
			<p class="text-muted-foreground">{reviews.length} reviews with images</p>
		</div>

		<!-- Reviews List -->
		<div class="space-y-8">
			{#each reviews as review (review.id)}
				<div class="pb-8 border-b last:border-b-0">
					<!-- Review Header -->
					<div class="flex items-start gap-3 mb-4">
						<!-- Avatar -->
						<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-600">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
						</div>

						<!-- Review Meta -->
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<h4 class="font-semibold">{review.author}</h4>
								<span class="text-sm text-muted-foreground">{review.date}</span>
							</div>

							<!-- Rating -->
							<div class="flex gap-0.5 mb-2">
								{#each { length: 5 } as _, i}
									<svg
										width="16"
										height="16"
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
					<h5 class="font-semibold mb-2">{review.title}</h5>
					<p class="text-muted-foreground mb-4">{review.text}</p>

					<!-- Images -->
					{#if review.images && review.images.length > 0}
						<div class="mb-4">
							<p class="text-sm font-semibold mb-2">Photos</p>
							<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
								{#each review.images as image}
									<div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
										<svg
											width="24"
											height="24"
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
								{/each}
							</div>
						</div>
					{/if}

					<!-- Helpful Button -->
					<button class="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="20 12 20 22 4 22 4 12" />
							<polyline points="2 7 12 2 22 7" />
						</svg>
						Helpful
					</button>
				</div>
			{/each}
		</div>

		<!-- View All -->
		<div class="mt-8 text-center">
			<Button variant="outline">View All Reviews</Button>
		</div>
	</div>
</section>
