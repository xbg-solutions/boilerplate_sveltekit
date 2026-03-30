<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Feature {
		icon?: string;
		title: string;
		description: string;
	}

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		features?: Feature[];
	}

	const defaultFeatures: Feature[] = [
		{ title: 'Lightning Fast', description: 'Built for performance with optimized components that load instantly.' },
		{ title: 'Fully Customizable', description: 'Every component can be tailored to match your brand perfectly.' },
		{ title: 'Dark Mode Ready', description: 'Beautiful light and dark modes out of the box.' },
	];

	let {
		class: className,
		title = 'Everything you need to ship faster',
		description = 'A comprehensive set of tools and components to accelerate your development workflow.',
		features = defaultFeatures,
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-12">
			<p class="text-xs uppercase tracking-widest text-muted-foreground">Feature Section</p>
			<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
				{title}
			</h2>
			<p class="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
				{description}
			</p>
		</div>

		<div class="mt-10 space-y-16">
			{#each features as feature, i}
				<div class="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:items-center {i % 2 === 1 ? 'sm:flex-row-reverse' : ''}">
					<div class={i % 2 === 1 ? 'sm:order-2' : ''}>
						<p class="text-xs uppercase tracking-widest text-muted-foreground font-medium">Feature</p>
						<h3 class="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{feature.title}</h3>
						<p class="mt-4 text-muted-foreground">{feature.description}</p>
						<a
							href="#"
							class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
						>
							Learn more
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="5" y1="12" x2="19" y2="12" />
								<polyline points="12 5 19 12 12 19" />
							</svg>
						</a>
					</div>

					<div class={i % 2 === 1 ? 'sm:order-1' : ''}>
						<div
							class="aspect-video w-full rounded-xl bg-muted flex items-center justify-center"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1"
								class="text-muted-foreground/40"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<circle cx="8.5" cy="8.5" r="1.5" />
								<polyline points="21 15 16 10 5 21" />
							</svg>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
