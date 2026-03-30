<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		badge?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		tertiaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
		onTertiary?: () => void;
	}

	let {
		class: className,
		badge = 'Featured',
		title = 'Achieve Your Goals',
		subtitle = 'Discover powerful tools and features designed to help you succeed',
		primaryLabel = 'Get Started',
		secondaryLabel = 'Learn More',
		tertiaryLabel = 'View Pricing',
		onPrimary,
		onSecondary,
		onTertiary
	}: Props = $props();
</script>

<section class={cn('w-full bg-gray-950 px-4 py-24 sm:py-32', className)}>
	<div class="mx-auto max-w-3xl text-center">
		{#if badge}
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-1.5 text-sm text-gray-300">
				{badge}
			</div>
		{/if}

		{#if title}
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">{title}</h1>
		{/if}

		{#if subtitle}
			<p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">{subtitle}</p>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<Button onclick={onPrimary} size="lg">
				{primaryLabel}
			</Button>
			<Button onclick={onSecondary} variant="outline" size="lg">
				{secondaryLabel}
			</Button>
			<Button onclick={onTertiary} variant="ghost" size="lg" class="text-white hover:text-white hover:bg-gray-900">
				{tertiaryLabel}
			</Button>
		</div>
	</div>
</section>
