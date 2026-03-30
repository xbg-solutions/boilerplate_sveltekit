<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
	}

	let {
		class: className,
		eyebrow = 'Premium Features',
		title = 'Elevate Your Experience',
		subtitle = 'Unlock powerful capabilities with our advanced platform',
		primaryLabel = 'Start Free Trial',
		onPrimary
	}: Props = $props();
</script>

<section
	class={cn('w-full bg-gray-950 px-4 py-24 sm:py-32 relative overflow-hidden', className)}
	style="background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px;"
>
	<div class="absolute inset-0 bg-gradient-to-b from-gray-950 via-transparent to-gray-950 pointer-events-none"></div>

	<div class="mx-auto max-w-3xl text-center relative z-10">
		{#if eyebrow}
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-1.5 text-sm text-gray-300">
				{eyebrow}
			</div>
		{/if}

		{#if title}
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">{title}</h1>
		{/if}

		{#if subtitle}
			<p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">{subtitle}</p>
		{/if}

		<Button onclick={onPrimary} size="lg">
			{primaryLabel}
		</Button>
	</div>
</section>
