<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		description?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		eyebrow = 'New release ✦',
		title = 'The modern way to build for the web',
		description,
		primaryLabel = 'Get started',
		secondaryLabel = 'View demo',
		onPrimary,
		onSecondary
	}: Props = $props();

	const imagePlaceholder = `<div class="w-full h-full bg-muted flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-muted-foreground/40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
</script>

<section class={cn('w-full bg-background px-4 py-20 sm:py-28', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 gap-12 sm:grid-cols-[3fr_2fr] items-center">
			<div>
				{#if eyebrow}
					<div class="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs">
						{eyebrow}
					</div>
				{/if}

				{#if title}
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h1>
				{/if}

				{#if description}
					<p class="text-lg text-muted-foreground mb-8">{description}</p>
				{/if}

				<div class="flex flex-col sm:flex-row gap-4">
					<Button onclick={onPrimary} size="lg">
						{primaryLabel}
					</Button>
					<Button onclick={onSecondary} variant="outline" size="lg">
						{secondaryLabel}
					</Button>
				</div>
			</div>

			<div class="mx-auto w-48 aspect-[9/19] rounded-[2rem] border-4 border-foreground bg-muted shadow-xl flex items-center justify-center overflow-hidden">
				{@html imagePlaceholder}
			</div>
		</div>
	</div>
</section>
