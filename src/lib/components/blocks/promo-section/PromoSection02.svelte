<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		heading?: string;
	}

	let { class: className, heading = 'Shop by Category' }: Props = $props();

	const categories = [
		{ id: 1, name: 'Electronics' },
		{ id: 2, name: 'Fashion' },
		{ id: 3, name: 'Home & Garden' },
	];
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<!-- Heading -->
		<h2 class="text-3xl sm:text-4xl font-bold mb-12 text-center">{heading}</h2>

		<!-- Category Cards Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each categories as category (category.id)}
				<div class="relative group overflow-hidden rounded-xl aspect-square">
					<!-- Background Image Placeholder -->
					<div class="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 flex items-center justify-center">
						<svg
							width="80"
							height="80"
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

					<!-- Overlay -->
					<div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white">
						<!-- Category Name -->
						<h3 class="text-3xl sm:text-4xl font-bold mb-4 text-center">{category.name}</h3>

						<!-- Shop Now Link -->
						<a
							href="#"
							class="inline-block px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
						>
							Shop now
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
