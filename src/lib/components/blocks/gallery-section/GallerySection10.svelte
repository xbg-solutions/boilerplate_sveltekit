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
		images = Array.from({ length: 12 }, (_, i) => ({ alt: `Image ${i + 1}` }))
	}: Props = $props();

	const imagePlaceholder = `<div class="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground/40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
</script>

<section class="w-full bg-foreground py-16 px-4">
	<div class="mx-auto max-w-6xl">
		{#if title || description}
			<div class="mb-8 text-center">
				<p class="mb-2 text-sm font-medium text-background/60">Gallery Section</p>
				{#if title}
					<h2 class="mb-2 text-3xl font-bold tracking-tight text-background sm:text-4xl">{title}</h2>
				{/if}
				{#if description}
					<p class="text-lg text-background/80">{description}</p>
				{/if}
			</div>
		{/if}

		<div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each images.slice(0, 12) as image}
				<div class="aspect-square">
					{@html imagePlaceholder}
				</div>
			{/each}
		</div>
	</div>
</section>
