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
		eyebrow = 'By the Numbers',
		title = 'Join Thousands of Happy Users',
		subtitle = 'We help teams collaborate better and ship faster than ever before.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
	}: Props = $props();

	const stats = [
		{ value: '10K+', label: 'Active Users' },
		{ value: '99.9%', label: 'Uptime' },
		{ value: '150+', label: 'Integrations' },
	];
</script>

<section class={cn('w-full bg-white px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<!-- Main Content -->
		<div class="text-center">
			<p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">{eyebrow}</p>
			<h1 class="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
				{title}
			</h1>
			<p class="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
				{subtitle}
			</p>

			<!-- CTA Buttons -->
			<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				<Button size="lg" onclick={onPrimary}>
					{primaryLabel}
				</Button>
				<Button variant="outline" size="lg" onclick={onSecondary}>
					{secondaryLabel}
				</Button>
			</div>
		</div>

		<!-- Stats Bar -->
		<div class="mt-16 border-t border-gray-200 pt-12">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				{#each stats as stat, i}
					<div class="text-center">
						<div class="text-4xl sm:text-5xl font-bold text-gray-900">{stat.value}</div>
						<div class="mt-2 text-gray-600">{stat.label}</div>
						{#if i < stats.length - 1}
							<div class="hidden md:block absolute top-1/2 right-0 w-px h-12 bg-gray-200 -translate-y-1/2" />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
