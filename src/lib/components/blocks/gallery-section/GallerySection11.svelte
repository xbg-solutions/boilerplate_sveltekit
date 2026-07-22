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

	let selectedIndex: number | null = $state(null);

	const imagePlaceholder = `<div class="w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground/40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
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
			{#each images.slice(0, 12) as image, index}
				<button
					class="aspect-square cursor-pointer transition-opacity hover:opacity-80"
					onclick={() => (selectedIndex = index)}
					type="button"
					aria-label={`Open image ${index + 1}`}
				>
					{@html imagePlaceholder}
				</button>
			{/each}
		</div>
	</div>

	{#if selectedIndex !== null}
		<div
			class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
			onclick={() => (selectedIndex = null)}
			onkeydown={(e) => { if (e.key === 'Escape') selectedIndex = null; }}
			role="dialog"
			tabindex="-1"
			aria-label="Image lightbox"
		>
			<div class="max-w-4xl w-full mx-4 relative" role="presentation" onclick={(e) => e.stopPropagation()}>
				<div class="aspect-video bg-black rounded-lg flex items-center justify-center">
					{@html imagePlaceholder}
				</div>
				<button
					class="absolute top-4 right-4 text-white hover:text-white/80 transition-opacity"
					onclick={() => (selectedIndex = null)}
					type="button"
					aria-label="Close lightbox"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</section>
