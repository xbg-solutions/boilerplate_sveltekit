<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		badge?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
	}

	let {
		class: className,
		badge = 'Starting at just $29/month',
		title = 'The Future of Work is Here',
		subtitle = 'Unlock your teams potential with powerful collaboration tools designed for modern businesses.',
		primaryLabel = 'Start building',
		onPrimary,
	}: Props = $props();
</script>

<section class={cn('w-full bg-gray-950 px-4 py-20 sm:py-28 sm:px-6 lg:px-8 relative overflow-hidden', className)}>
	<!-- Grid Background Effect -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
		<svg
			class="absolute inset-0 w-full h-full opacity-10"
			width="100%"
			height="100%"
		>
			<defs>
				<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#grid)" />
		</svg>
	</div>

	<!-- Glow Effects -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

	<div class="relative z-10 mx-auto max-w-4xl">
		<div class="text-center">
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 rounded-full border border-blue-900 bg-blue-950/50 px-4 py-2 mb-8">
				<span class="text-sm font-medium text-blue-300">{badge}</span>
			</div>

			<!-- Headline -->
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
				{title}
			</h1>

			<!-- Subtitle -->
			<p class="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
				{subtitle}
			</p>

			<!-- Primary CTA -->
			<div class="mt-10">
				<Button size="lg" onclick={onPrimary} class="bg-blue-600 hover:bg-blue-700">
					{primaryLabel}
				</Button>
			</div>

			<!-- Trust Text -->
			<p class="mt-8 text-sm text-gray-500">
				No credit card required. Start free for 14 days.
			</p>
		</div>
	</div>
</section>
