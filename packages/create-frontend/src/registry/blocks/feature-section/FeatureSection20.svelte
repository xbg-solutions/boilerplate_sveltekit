<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface FullWidthFeature {
		title: string;
		description: string;
		imagePosition: 'left' | 'right';
	}

	interface Props {
		class?: string;
		features?: FullWidthFeature[];
	}

	const defaultFeatures: FullWidthFeature[] = [
		{
			title: 'Advanced Analytics',
			description: 'Get deep insights into your data with powerful analytics tools. Track metrics in real-time and make informed decisions.',
			imagePosition: 'right',
		},
		{
			title: 'Seamless Integration',
			description: 'Connect with your favorite tools and platforms effortlessly. Our API integrates with everything you use daily.',
			imagePosition: 'left',
		},
		{
			title: 'World-Class Support',
			description: 'Our dedicated team is here to help you succeed. Get expert assistance whenever you need it, around the clock.',
			imagePosition: 'right',
		},
	];

	let {
		class: className,
		features = defaultFeatures,
	}: Props = $props();
</script>

<section class={cn('w-full bg-white', className)}>
	{#each features as feature, index}
		<div class={cn('min-h-screen flex items-center py-16 px-4 sm:px-6 lg:px-8', index % 2 === 1 ? 'bg-gray-50' : 'bg-white')}>
			<div class="mx-auto w-full max-w-6xl">
				<div class={cn('grid grid-cols-1 lg:grid-cols-2 gap-12 items-center', feature.imagePosition === 'left' ? 'lg:grid-cols-2' : '')}>
					<!-- Text Content -->
					<div class={cn(feature.imagePosition === 'right' ? '' : 'lg:order-2')}>
						<h2 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
							{feature.title}
						</h2>
						<p class="text-xl text-gray-600 mb-8 leading-relaxed">
							{feature.description}
						</p>
						<button class="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
							Learn More
							<svg class="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="5" y1="12" x2="19" y2="12"></line>
								<polyline points="12 5 19 12 12 19"></polyline>
							</svg>
						</button>
					</div>

					<!-- Image Placeholder -->
					<div class={cn(feature.imagePosition === 'right' ? '' : 'lg:order-1')}>
						<div class="w-full aspect-video bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl shadow-2xl"></div>
					</div>
				</div>
			</div>
		</div>
	{/each}
</section>
