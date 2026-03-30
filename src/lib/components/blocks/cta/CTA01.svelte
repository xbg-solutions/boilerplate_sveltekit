<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let {
		class: className = '',
		eyebrow = 'CTA Section',
		headline = 'Action-driving headline that creates urgency',
		description = 'Supporting description that explains the value proposition and encourages immediate action.',
		ctaLabel = 'Get started',
		onCta = () => {}
	}: {
		class?: string;
		eyebrow?: string;
		headline?: string;
		description?: string;
		ctaLabel?: string;
		onCta?: () => void;
	} = $props();
</script>

<section class={cn('w-full bg-foreground text-background py-16 sm:py-24 px-4', className)}>
	<div class="mx-auto max-w-3xl text-center">
		<!-- Eyebrow -->
		<p class="text-sm font-medium uppercase tracking-wide opacity-60 mb-4">{eyebrow}</p>

		<!-- Headline -->
		<h2 class="text-3xl sm:text-4xl font-bold mb-6">{headline}</h2>

		<!-- Description -->
		<p class="text-sm opacity-70 mb-8">{description}</p>

		<!-- CTA Button -->
		<button
			onclick={onCta}
			class="inline-flex items-center gap-2 rounded-md border border-background/30 bg-background/10 px-5 py-2.5 text-sm font-medium text-background hover:bg-background/20 transition-colors"
		>
			{ctaLabel}
			<svg width="16" height="16" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
				<line x1="5" y1="12" x2="19" y2="12" />
				<polyline points="12 5 19 12 12 19" />
			</svg>
		</button>
	</div>
</section>
