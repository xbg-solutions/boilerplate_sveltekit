<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		images?: Array<{ src?: string; alt?: string; caption?: string }>;
	}

	let {
		class: className,
		title = 'Explore our gallery',
		description = 'Premium featured showcase with curated highlights',
		images = Array.from({ length: 1 }, (_, i) => ({ alt: `Feature ${i + 1}` }))
	}: Props = $props();

	const features = ['Premium quality materials', 'Handcrafted details', 'Sustainable practices', 'Limited edition availability'];

	const imagePlaceholder = `<div class="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground/40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
</script>

<section class={cn('w-full px-4 py-16', className)}>
	<div class="mx-auto max-w-6xl">
		{#if title || description}
			<div class="mb-12 text-center">
				<p class="mb-2 text-sm font-medium text-muted-foreground">Gallery Section</p>
				{#if title}
					<h2 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
				{/if}
				{#if description}
					<p class="text-lg text-muted-foreground">{description}</p>
				{/if}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-12 sm:grid-cols-2 items-center">
			<div class="aspect-square">
				{@html imagePlaceholder}
			</div>

			<div>
				<h3 class="text-2xl font-bold mb-4">Premium Feature Collection</h3>
				<p class="text-muted-foreground mb-6">Discover our handpicked selection of exceptional items carefully curated for discerning customers.</p>

				<ul class="space-y-4 mb-8">
					{#each features as feature}
						<li class="flex items-start gap-3">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="shrink-0 text-foreground mt-0.5"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
							<span class="text-base">{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="flex gap-3">
					<button class="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors">
						Learn More
					</button>
					<button class="px-6 py-2 border border-foreground rounded-lg font-medium hover:bg-foreground/5 transition-colors">
						View Collection
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
