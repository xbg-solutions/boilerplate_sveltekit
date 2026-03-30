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

	const stats = [
		{ value: '10K+', label: 'Active Users' },
		{ value: '99.9%', label: 'Uptime' },
		{ value: '4.9/5', label: 'Rating' }
	];
</script>

<section class={cn('w-full bg-background px-4 py-20 sm:py-28', className)}>
	<div class="mx-auto max-w-3xl">
		<div class="text-center">
			{#if eyebrow}
				<div class="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs">
					{eyebrow}
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

		<div class="mt-12 grid grid-cols-3 gap-8 border-t pt-8">
			{#each stats as stat}
				<div class="text-center">
					<p class="text-3xl font-bold">{stat.value}</p>
					<p class="mt-2 text-sm text-muted-foreground">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
