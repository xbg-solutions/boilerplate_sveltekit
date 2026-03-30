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
</script>

<section class={cn('w-full bg-foreground text-background py-20 sm:py-28 px-4', className)}>
	<div class="mx-auto max-w-3xl text-center">
		{#if eyebrow}
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs">
				{eyebrow}
			</div>
		{/if}

		{#if title}
			<h1 class="text-4xl sm:text-6xl font-bold tracking-tight mb-4">{title}</h1>
		{/if}

		{#if description}
			<p class="text-lg text-background/80 mb-8">{description}</p>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<Button onclick={onPrimary} size="lg" variant="secondary">
				{primaryLabel}
			</Button>
			<Button onclick={onSecondary} variant="outline" size="lg" class="border-background/30 text-background hover:bg-background/10">
				{secondaryLabel}
			</Button>
		</div>
	</div>
</section>
