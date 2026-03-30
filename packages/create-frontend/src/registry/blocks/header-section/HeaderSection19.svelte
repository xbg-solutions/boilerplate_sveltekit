<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		title = 'Unlock Your Potential',
		subtitle = 'Join thousands of users who have transformed their business with our platform',
		primaryLabel = 'Get Started',
		secondaryLabel = 'View Demo',
		onPrimary,
		onSecondary
	}: Props = $props();
</script>

<section class={cn('w-full bg-gray-950 px-4 py-24 sm:py-32', className)}>
	<div class="mx-auto max-w-3xl text-center">
		{#if title}
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
				{title}
			</h1>
		{/if}

		{#if subtitle}
			<p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">{subtitle}</p>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<Button onclick={onPrimary} size="lg">
				{primaryLabel}
			</Button>
			<Button onclick={onSecondary} variant="outline" size="lg" class="border-gray-700 text-white hover:bg-gray-900">
				{secondaryLabel}
			</Button>
		</div>
	</div>
</section>
