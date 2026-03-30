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
			category: 'Tutorial',
			excerpt:
				"Learn how to set up and maximize your development workflow with shadcn/ui's powerful component library."
		},
		{
			title: 'Building Dark Mode with Next.js and Tailwind CSS',
			date: 'Mar 12, 2024',
			category: 'Development',
			excerpt:
				'Implement a seamless dark mode toggle in your Next.js application using Tailwind CSS and shadcn/ui.'
		},
		{
			title: 'Mastering React Server Components Effectively',
			date: 'Mar 8, 2024',
			category: 'Advanced',
			excerpt:
				"Deep dive into React Server Components and learn how they can improve your application's performance."
		}
	];

	let { class: className, title = 'Featured Articles', description = 'Discover in-depth guides and tutorials', posts = defaultPosts, eyebrow = 'Blog Section' }: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl text-center">
		<p class="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
		<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
		<p class="mt-3 text-muted-foreground">{description}</p>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
		{#each posts as post (post.title)}
			<article class="flex flex-col">
				<div class="flex items-center text-xs text-muted-foreground">
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
				<h3 class="mt-2 font-semibold leading-snug">{post.title}</h3>
				{#if post.excerpt}
					<p class="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
				{/if}
				<div class="mt-4 aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
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
			</article>
		{/each}
	</div>
</section>
