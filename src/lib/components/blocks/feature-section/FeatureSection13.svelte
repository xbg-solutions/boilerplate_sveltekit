<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Feature {
		number: number;
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
		{
			number: 1,
			title: 'Lightning Fast Setup',
			description: 'Get started in minutes with our intuitive onboarding process.',
		},
		{
			number: 2,
			title: 'Powerful Analytics',
			description: 'Track performance metrics and gain actionable insights.',
		},
		{
			number: 3,
			title: 'Seamless Integration',
			description: 'Connect with your favorite tools and platforms.',
		},
		{
			number: 4,
			title: 'Expert Support',
			description: 'Get help from our experienced support team anytime.',
		},
		{
			number: 5,
			title: 'Enterprise Security',
			description: 'Bank-level encryption and compliance standards.',
		},
	];

	let {
		class: className,
		title = 'How It Works',
		subtitle = 'A simple workflow designed for success',
		features = defaultFeatures,
	}: Props = $props();
</script>

<section class={cn('w-full bg-white py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Left Column: Screenshot Placeholder -->
			<div class="flex items-center justify-center">
				<div class="w-full aspect-video bg-gray-200 rounded-lg shadow-lg"></div>
			</div>

			<!-- Right Column: Feature List -->
			<div>
				<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
					{title}
				</h2>
				<p class="text-lg text-gray-600 mb-8">
					{subtitle}
				</p>

				<div class="space-y-6">
					{#each features as feature}
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
									{feature.number}
								</div>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-gray-900">{feature.title}</h3>
								<p class="mt-1 text-gray-600 text-sm">{feature.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
