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

	let activeTab = $state(0);
	const tabFeatures = features.slice(0, 4);
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

		<div class="mt-10">
			<div class="flex gap-2 flex-wrap border-b">
				{#each tabFeatures as feature, i}
					<button
						onclick={() => (activeTab = i)}
						class={cn(
							'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px]',
							activeTab === i
								? 'border-foreground text-foreground'
								: 'border-transparent text-muted-foreground hover:text-foreground'
						)}
					>
						{feature.title}
					</button>
				{/each}
			</div>

			<div class="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:items-center">
				<div>
					<h3 class="text-2xl sm:text-3xl font-bold text-foreground">{tabFeatures[activeTab].title}</h3>
					<p class="mt-4 text-muted-foreground">{tabFeatures[activeTab].description}</p>
				</div>

				<div>
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
		</div>
	</div>
</section>
