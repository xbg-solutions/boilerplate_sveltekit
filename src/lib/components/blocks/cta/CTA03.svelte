<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let {
		class: className = '',
		eyebrow = 'CTA Section',
		headline = 'Powerful features await',
		description = 'Discover everything you need to succeed with our comprehensive platform.',
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

<section class={cn('w-full bg-muted py-8 px-4', className)}>
	<div class="mx-auto max-w-5xl rounded-xl bg-foreground text-background p-6 sm:p-10">
		<div class="flex flex-col sm:flex-row gap-8">
			<!-- Left: Image -->
			<div class="flex-shrink-0 sm:w-1/2">
				<div class="rounded-lg bg-muted flex items-center justify-center aspect-video">
					<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" class="opacity-60">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="1" fill="none" />
					</svg>
				</div>
			</div>

			<!-- Right: Content -->
			<div class="sm:w-1/2 flex flex-col justify-center">
				<p class="text-sm font-medium uppercase tracking-wide opacity-60 mb-2">{eyebrow}</p>
				<h3 class="text-2xl sm:text-3xl font-bold mb-4">{headline}</h3>
				<p class="text-sm opacity-70 mb-6">{description}</p>
				<button
					onclick={onCta}
					class="inline-flex items-center gap-2 w-fit rounded-md border border-background/30 bg-background/10 px-5 py-2.5 text-sm font-medium text-background hover:bg-background/20 transition-colors"
				>
					{ctaLabel}
					<svg width="16" height="16" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
						<line x1="5" y1="12" x2="19" y2="12" />
						<polyline points="12 5 19 12 12 19" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>
