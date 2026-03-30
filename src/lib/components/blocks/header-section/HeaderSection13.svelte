<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
		authorName?: string;
		authorImage?: string;
		publishDate?: string;
		readTime?: string;
		tags?: string[];
	}

	let {
		class: className,
		eyebrow = 'Latest Article',
		title = 'The Future of Web Development',
		subtitle = 'Explore emerging technologies and best practices shaping modern web development',
		primaryLabel = 'Read Full Article',
		onPrimary,
		authorName = 'Sarah Anderson',
		authorImage = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
		publishDate = 'March 28, 2026',
		readTime = '8 min read',
		tags = ['Web Dev', 'Technology', 'Design']
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:py-24', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
			<div class="lg:col-span-2">
				{#if eyebrow}
					<div class="mb-4 inline-flex items-center px-3 py-1 rounded-full border bg-muted/50 text-xs font-medium">
						{eyebrow}
					</div>
				{/if}

				{#if title}
					<h1 class="text-5xl sm:text-6xl font-bold tracking-tight mb-6">{title}</h1>
				{/if}

				{#if subtitle}
					<p class="text-xl text-muted-foreground mb-8">{subtitle}</p>
				{/if}

				<Button onclick={onPrimary} size="lg">
					{primaryLabel}
				</Button>
			</div>

			<div class="lg:col-span-1">
				<div class="rounded-lg border bg-muted/50 p-6 sticky top-4">
					<div class="flex items-center gap-4 mb-6">
						<img
							src={authorImage}
							alt={authorName}
							class="w-12 h-12 rounded-full object-cover"
						/>
						<div class="flex-1">
							<p class="font-semibold text-sm">{authorName}</p>
							<p class="text-xs text-muted-foreground">{publishDate}</p>
						</div>
					</div>

					<div class="space-y-1 mb-6 pb-6 border-b">
						<p class="text-sm text-muted-foreground">Reading time</p>
						<p class="font-semibold">{readTime}</p>
					</div>

					{#if tags && tags.length > 0}
						<div>
							<p class="text-sm text-muted-foreground mb-3">Tags</p>
							<div class="flex flex-wrap gap-2">
								{#each tags as tag}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
										{tag}
									</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
