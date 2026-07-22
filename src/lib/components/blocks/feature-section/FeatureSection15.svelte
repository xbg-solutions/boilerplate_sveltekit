<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface TabContent {
		label: string;
		title: string;
		description: string;
	}

	interface Props {
		class?: string;
		heading?: string;
		tabs?: TabContent[];
	}

	const defaultTabs: TabContent[] = [
		{
			label: 'Performance',
			title: 'Lightning Speed',
			description: 'Optimized performance with minimal bundle size and instant load times.',
		},
		{
			label: 'Security',
			title: 'Secure by Design',
			description: 'Enterprise-grade security with encryption and compliance built-in.',
		},
		{
			label: 'Scalability',
			title: 'Grows With You',
			description: 'Infrastructure designed to handle millions of requests per day.',
		},
		{
			label: 'Developer Experience',
			title: 'Easy to Use',
			description: 'Clean API and comprehensive documentation for rapid development.',
		},
		{
			label: 'Support',
			title: 'Always There',
			description: '24/7 support from our expert team with quick response times.',
		},
	];

	let {
		class: className,
		heading = 'Feature Highlights',
		tabs = defaultTabs,
	}: Props = $props();

	let activeTab = $state(0);
</script>

<section class={cn('w-full bg-white py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-center mb-12">
			{heading}
		</h2>

		<!-- Tab Buttons -->
		<div class="flex flex-wrap justify-center gap-2 mb-8">
			{#each tabs as tab, index}
				<button
					onclick={() => (activeTab = index)}
					class={cn(
						'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
						activeTab === index
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Content Area -->
		<div class="mt-8">
			{#key activeTab}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
					<!-- Left: Text Content -->
					<div>
						<h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
							{tabs[activeTab].title}
						</h3>
						<p class="text-lg text-gray-600 mb-8">
							{tabs[activeTab].description}
						</p>
						<button
							class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
						>
							Learn More
							<svg class="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="5" y1="12" x2="19" y2="12"></line>
								<polyline points="12 5 19 12 12 19"></polyline>
							</svg>
						</button>
					</div>

					<!-- Right: Screenshot Placeholder -->
					<div class="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-lg"></div>
				</div>
			{/key}
		</div>
	</div>
</section>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.animate-fade-in) {
		animation: fadeIn 300ms ease-out;
	}
</style>
