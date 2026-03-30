<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Stat {
		number: string;
		label: string;
		description: string;
	}

	interface Props {
		class?: string;
		heading?: string;
		subtitle?: string;
		ctaText?: string;
		stats?: Stat[];
	}

	const defaultStats: Stat[] = [
		{ number: '10M+', label: 'Users Worldwide', description: 'Trusted by millions' },
		{ number: '99.99%', label: 'Uptime', description: 'Reliable infrastructure' },
		{ number: '50+', label: 'Integrations', description: 'Connect everything' },
		{ number: '24/7', label: 'Support', description: 'Always available' },
	];

	let {
		class: className,
		heading = 'Trusted by the Best',
		subtitle = 'Join thousands of companies succeeding with our platform.',
		ctaText = 'Get Started',
		stats = defaultStats,
	}: Props = $props();
</script>

<section class={cn('w-full bg-white py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Left Column: Content -->
			<div>
				<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
					{heading}
				</h2>
				<p class="text-lg text-gray-600 mb-8">
					{subtitle}
				</p>
				<button
					class="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
				>
					{ctaText}
					<svg class="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="5" y1="12" x2="19" y2="12"></line>
						<polyline points="12 5 19 12 12 19"></polyline>
					</svg>
				</button>
			</div>

			<!-- Right Column: Stats Grid -->
			<div class="grid grid-cols-2 gap-6">
				{#each stats as stat}
					<div class="p-6 rounded-lg bg-gray-50 border border-gray-200 text-center">
						<div class="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
							{stat.number}
						</div>
						<div class="text-lg font-semibold text-gray-900 mb-1">
							{stat.label}
						</div>
						<div class="text-sm text-gray-600">
							{stat.description}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
