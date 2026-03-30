<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Feature {
		icon: string;
		title: string;
		description: string;
	}

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		features?: Feature[];
	}

	const defaultFeatures: Feature[] = [
		{ icon: 'zap', title: 'Lightning Speed', description: 'Instant load times and responsive interactions.' },
		{ icon: 'shield', title: 'Secure by Default', description: 'Enterprise-grade security built in.' },
		{ icon: 'palette', title: 'Beautiful Design', description: 'Modern, polished interface included.' },
		{ icon: 'code', title: 'Developer Friendly', description: 'Clean API and excellent documentation.' },
		{ icon: 'users', title: 'Team Collaboration', description: 'Built for teams of any size.' },
		{ icon: 'trending-up', title: 'Scale Easily', description: 'Grows with your business needs.' },
	];

	let {
		class: className,
		title = 'Powerful Features',
		subtitle = 'Everything you need to succeed',
		features = defaultFeatures,
	}: Props = $props();

	const iconPaths: Record<string, { viewBox: string; path: string }> = {
		zap: { viewBox: '0 0 24 24', path: 'm13 2-2 6.5h5l-7 13.5 2-6.5H6l7-13.5z' },
		shield: { viewBox: '0 0 24 24', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
		palette: { viewBox: '0 0 24 24', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z' },
		code: { viewBox: '0 0 24 24', path: 'M16 18 22 12 16 6M8 6 2 12 8 18' },
		users: { viewBox: '0 0 24 24', path: 'M17 21h-5v-2h5v2zM16 5.76A2.5 2.5 0 0 0 13.5 3 2.5 2.5 0 0 0 11 5.5 2.5 2.5 0 0 0 13.5 8 2.5 2.5 0 0 0 16 5.76zM8 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
		'trending-up': { viewBox: '0 0 24 24', path: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 9 12.41l4 4 6.3-6.29L22 12v-6z' },
	};
</script>

<section class={cn('w-full bg-white py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-12">
			<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
				{title}
			</h2>
			<p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
				{subtitle}
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div
					class="p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gray-50"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
							{#if iconPaths[feature.icon]}
								<g>
									{@html `<path d="${iconPaths[feature.icon].path}" />`}
								</g>
							{:else}
								<circle cx="12" cy="12" r="3" />
							{/if}
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900">{feature.title}</h3>
					<p class="mt-2 text-gray-600 text-sm">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
