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
		{ title: 'Accessible', description: 'WCAG 2.1 compliant with keyboard navigation and screen reader support.' },
		{ title: 'Open Source', description: 'MIT licensed and free to use in any project, personal or commercial.' },
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

		<div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
			{#each features as feature, i}
				<div>
					<div class="text-4xl font-black text-muted-foreground/20 mb-4">
						{String(i + 1).padStart(2, '0')}
					</div>
					<h3 class="text-lg font-semibold text-foreground">{feature.title}</h3>
					<p class="mt-2 text-muted-foreground text-sm">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
