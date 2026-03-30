<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		eyebrow = 'Powerful Features',
		title = 'Build Everything You Need',
		subtitle = 'Comprehensive tools designed to help you succeed.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Schedule demo',
		onPrimary,
		onSecondary,
	}: Props = $props();

	const features = [
		{
			title: 'Lightning Fast',
			description: 'Optimized performance for teams of any size',
		},
		{
			title: 'Secure & Reliable',
			description: 'Enterprise-grade security and 99.9% uptime',
		},
		{
			title: 'Easy Integration',
			description: 'Seamlessly connect with your favorite tools',
		},
	];
</script>

<section class={cn('w-full bg-white px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
			<!-- Left Content -->
			<div>
				<p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">{eyebrow}</p>
				<h1 class="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
					{title}
				</h1>
				<p class="mt-6 text-lg text-gray-600 max-w-xl">
					{subtitle}
				</p>

				<!-- CTA Buttons -->
				<div class="mt-8 flex flex-col sm:flex-row gap-4">
					<Button size="lg" onclick={onPrimary}>
						{primaryLabel}
					</Button>
					<Button variant="outline" size="lg" onclick={onSecondary}>
						{secondaryLabel}
					</Button>
				</div>
			</div>

			<!-- Right Floating Feature Cards -->
			<div class="space-y-4">
				{#each features as feature, i}
					<div
						class={cn(
							'rounded-xl border bg-white p-6 shadow-lg transition-transform hover:scale-105',
							i === 1 ? 'border-blue-200 lg:ml-8' : 'border-gray-200'
						)}
					>
						<div class="flex items-start gap-4">
							<div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-blue-600">
									<path d="M12 2L15 10H23L17 15L19 23L12 18L5 23L7 15L1 10H9L12 2Z" />
								</svg>
							</div>
							<div>
								<h3 class="font-bold text-gray-900">{feature.title}</h3>
								<p class="mt-1 text-sm text-gray-600">{feature.description}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
