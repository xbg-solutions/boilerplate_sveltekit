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

<section class={cn('w-full bg-background px-4 py-20 sm:py-28', className)}>
	<div class="mx-auto max-w-3xl text-center">
		{#if eyebrow}
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
				🎉 {eyebrow}
			</div>
		{/if}

		{#if title}
			<h1 class="text-4xl sm:text-6xl font-bold tracking-tight mb-4">{title}</h1>
		{/if}

		{#if description}
			<p class="text-lg text-muted-foreground mb-8">{description}</p>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<Button onclick={onPrimary} size="lg">
				{primaryLabel}
			</Button>
			<Button onclick={onSecondary} variant="outline" size="lg">
				{secondaryLabel}
			</Button>
		</div>
	</div>
</section>
