<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		images?: Array<{ src?: string; alt?: string; caption?: string }>;
	}

	let {
		class: className,
		title = 'Explore our gallery',
		description,
		images = Array.from({ length: 6 }, (_, i) => ({ alt: `Image ${i + 1}` }))
	}: Props = $props();

	const imagePlaceholder = `<div class="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground/40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

	const aspectRatios = ['aspect-square', 'aspect-square', 'aspect-[3/4]', 'aspect-[3/4]', 'aspect-square', 'aspect-square'];
</script>

<section class={cn('w-full px-4 py-16', className)}>
	<div class="mx-auto max-w-6xl">
		{#if title || description}
			<div class="mb-8 text-center">
				<p class="mb-2 text-sm font-medium text-muted-foreground">Gallery Section</p>
				{#if title}
					<h2 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
				{/if}
				{#if description}
					<p class="text-lg text-muted-foreground">{description}</p>
				{/if}
			</div>
		{/if}

		<div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each images.slice(0, 6) as image, index}
				<div class={aspectRatios[index]}>
					{@html imagePlaceholder}
				</div>
			{/each}
		</div>
	</div>
</section>
