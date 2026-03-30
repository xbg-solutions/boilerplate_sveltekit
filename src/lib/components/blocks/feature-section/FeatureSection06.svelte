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

		<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each features as feature}
				<div class="text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto mb-3">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground">
							<circle cx="12" cy="12" r="3" />
							<path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
						</svg>
					</div>
					<h3 class="font-semibold text-foreground text-sm">{feature.title}</h3>
				</div>
			{/each}
		</div>
	</div>
</section>
