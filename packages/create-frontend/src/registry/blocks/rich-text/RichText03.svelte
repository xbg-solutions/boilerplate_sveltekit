<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		date?: string;
		readTime?: string;
		imageUrl?: string;
		paragraphs?: string[];
	}

	const {
		class: className,
		title = 'Article Title',
		date = 'Mar 15, 2024',
		readTime = '5 min read',
		imageUrl,
		paragraphs = [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
			'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
		]
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-2xl">
		<div class="aspect-[16/6] w-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
			{#if imageUrl}
				<img src={imageUrl} alt={title} class="w-full h-full object-cover" />
			{:else}
				<div class="text-muted-foreground">Image placeholder</div>
			{/if}
		</div>

		<div class="mt-8">
			<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
			<div class="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
				<span>{date}</span>
				<span>·</span>
				<span>{readTime}</span>
			</div>

			<div class="mt-8 space-y-4 text-base leading-7 text-muted-foreground">
				{#each paragraphs as paragraph}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>
