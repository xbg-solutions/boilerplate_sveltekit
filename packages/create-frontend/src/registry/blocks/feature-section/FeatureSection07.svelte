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
		{ title: 'TypeScript Native', description: 'Full TypeScript support with complete type definitions.' },
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

		<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-[3fr_2fr]">
			<div class="rounded-xl border p-8 bg-muted/30">
				<div
					class="aspect-video w-full rounded-lg bg-muted flex items-center justify-center mb-6"
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
				{#if features[0]}
					<h3 class="text-xl font-semibold text-foreground">{features[0].title}</h3>
					<p class="mt-2 text-muted-foreground">{features[0].description}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-4">
				{#each features.slice(1, 4) as feature}
					<div class="rounded-lg border p-4 bg-muted/30">
						<h3 class="font-semibold text-foreground text-sm">{feature.title}</h3>
						<p class="mt-1 text-muted-foreground text-xs">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
