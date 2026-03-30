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
				"Learn how to set up and maximize your development workflow with shadcn/ui's powerful component library.",
			author: { name: 'John Doe', role: 'Developer' }
		},
		{
			title: 'Building Dark Mode with Next.js and Tailwind CSS',
			date: 'Mar 12, 2024',
			category: 'Development',
			excerpt:
				'Implement a seamless dark mode toggle in your Next.js application using Tailwind CSS and shadcn/ui.',
			author: { name: 'Jane Smith', role: 'Designer' }
		},
		{
			title: 'Mastering React Server Components Effectively',
			date: 'Mar 8, 2024',
			category: 'Advanced',
			excerpt:
				"Deep dive into React Server Components and learn how they can improve your application's performance.",
			author: { name: 'Alice Johnson', role: 'Developer' }
		},
		{
			title: 'The Future of Web Development in 2024',
			date: 'Mar 5, 2024',
			category: 'Insights',
			excerpt: 'Explore the latest trends and technologies shaping the future of web development this year.',
			author: { name: 'John Doe', role: 'Developer' }
		}
	];

	let { class: className, title = 'From the Blog', description = 'Stay updated with our latest insights', posts = defaultPosts, eyebrow = 'Blog Section' }: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div>
			<p class="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
			<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
			<p class="mt-3 text-muted-foreground">{description}</p>
		</div>

		<div class="mt-8 flex flex-col divide-y border-t">
			{#each posts as post (post.title)}
				<article class="flex flex-col sm:flex-row gap-4 sm:gap-6 py-6">
					<div class="w-full sm:w-40 flex-shrink-0">
						<div class="aspect-video sm:aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
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
					</div>

					<div class="flex flex-col flex-1 min-w-0">
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
							<p class="mt-2 text-sm text-muted-foreground flex-1">{post.excerpt}</p>
						{/if}
						{#if post.author}
							<div class="mt-4 flex items-center gap-3">
								<div class="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
								<div class="min-w-0">
									<p class="text-sm font-medium truncate">{post.author.name}</p>
									{#if post.author.role}
										<p class="text-xs text-muted-foreground truncate">{post.author.role}</p>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
