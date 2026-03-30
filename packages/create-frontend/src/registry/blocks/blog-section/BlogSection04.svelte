<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface BlogPost {
		title: string;
		excerpt?: string;
		date?: string;
		category?: string;
		imageUrl?: string;
		author?: { name: string; role?: string; avatarUrl?: string };
		href?: string;
	}

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		posts?: BlogPost[];
		eyebrow?: string;
	}

	const defaultPosts: BlogPost[] = [
		{
			title: 'Getting Started with shadcn/ui: A Complete Guide',
			date: 'Mar 15, 2024',
			category: 'Tutorial'
		},
		{
			title: 'Building Dark Mode with Next.js and Tailwind CSS',
			date: 'Mar 12, 2024',
			category: 'Development'
		},
		{
			title: 'Mastering React Server Components Effectively',
			date: 'Mar 8, 2024',
			category: 'Advanced'
		},
		{
			title: 'The Future of Web Development in 2024',
			date: 'Mar 5, 2024',
			category: 'Insights'
		}
	];

	let { class: className, title = 'Latest Blog Posts', description = 'Read our most recent articles', posts = defaultPosts.slice(0, 4), eyebrow = 'Blog Section' }: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="flex items-end justify-between">
			<div>
				<p class="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
				<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
				<p class="mt-3 text-muted-foreground">{description}</p>
			</div>
			<a href="#" class="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground underline"
				>View all articles</a
			>
		</div>

		<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
			{#each posts as post (post.title)}
				<article class="flex flex-col overflow-hidden rounded-lg border">
					<div class="aspect-video w-full bg-muted flex items-center justify-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							class="text-muted-foreground"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
					</div>
					<div class="p-4">
						<h3 class="font-semibold leading-snug">{post.title}</h3>
						<div class="mt-1 flex items-center text-xs text-muted-foreground">
							{#if post.date}
								<span>{post.date}</span>
							{/if}
							{#if post.date && post.category}
								<span class="mx-1">·</span>
							{/if}
							{#if post.category}
								<span>{post.category}</span>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
