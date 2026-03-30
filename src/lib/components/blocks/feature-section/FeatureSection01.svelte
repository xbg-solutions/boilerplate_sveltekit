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

	const iconComponents: Record<string, { viewBox: string; path: string }> = {
		lightning: {
			viewBox: '0 0 24 24',
			path: 'm13 2-2 6.5h5l-7 13.5 2-6.5H6l7-13.5z',
		},
		settings: {
			viewBox: '0 0 24 24',
			path: 'M3 12a9 9 0 0 0 9 9M12 3a9 9 0 0 0-9 9M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0',
		},
		moon: {
			viewBox: '0 0 24 24',
			path: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
		},
		code: {
			viewBox: '0 0 24 24',
			path: 'M16 18 22 12 16 6M8 6 2 12 8 18',
		},
		shield: {
			viewBox: '0 0 24 24',
			path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
		},
		lock: {
			viewBox: '0 0 24 24',
			path: 'M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11zM7 11V7a5 5 0 0 1 10 0v4',
		},
	};
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
			{#each features as feature}
				<div>
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-4">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground">
							{#if feature.icon && iconComponents[feature.icon]}
								<g>
									{@html `<path d="${iconComponents[feature.icon].path}" />`}
								</g>
							{:else}
								<circle cx="12" cy="12" r="3" />
								<path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
							{/if}
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-foreground">{feature.title}</h3>
					<p class="mt-2 text-muted-foreground text-sm">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
