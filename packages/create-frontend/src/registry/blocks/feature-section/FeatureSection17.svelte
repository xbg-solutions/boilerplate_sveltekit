<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface TimelineStep {
		number: number;
		title: string;
		description: string;
		align: 'left' | 'right';
	}

	interface Props {
		class?: string;
		heading?: string;
		steps?: TimelineStep[];
	}

	const defaultSteps: TimelineStep[] = [
		{
			number: 1,
			title: 'Get Started',
			description: 'Sign up and create your first project in minutes.',
			align: 'left',
		},
		{
			number: 2,
			title: 'Configure',
			description: 'Set up your preferences and integrations.',
			align: 'right',
		},
		{
			number: 3,
			title: 'Build',
			description: 'Create amazing products with powerful tools.',
			align: 'left',
		},
		{
			number: 4,
			title: 'Deploy',
			description: 'Launch to production with one click.',
			align: 'right',
		},
		{
			number: 5,
			title: 'Grow',
			description: 'Scale your business with confidence.',
			align: 'left',
		},
	];

	let {
		class: className,
		heading = 'The Journey to Success',
		steps = defaultSteps,
	}: Props = $props();
</script>

<section class={cn('w-full bg-white py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-4xl">
		<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-center mb-16">
			{heading}
		</h2>

		<div class="relative">
			<!-- Timeline Line -->
			<div class="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-200 transform -translate-x-1/2"></div>

			<!-- Steps -->
			<div class="space-y-12">
				{#each steps as step}
					<div class={cn('flex gap-8', step.align === 'right' ? 'flex-row-reverse' : 'flex-row')}>
						<!-- Content -->
						<div class="flex-1 pt-2">
							<div class={cn('p-6 bg-gray-50 rounded-lg border border-gray-200', step.align === 'right' ? 'text-right' : '')}>
								<h3 class="text-lg font-semibold text-gray-900">{step.title}</h3>
								<p class="mt-2 text-gray-600 text-sm">{step.description}</p>
							</div>
						</div>

						<!-- Timeline Circle -->
						<div class="flex justify-center">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold border-4 border-white shadow-lg">
								{step.number}
							</div>
						</div>

						<!-- Empty Space -->
						<div class="flex-1"></div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
