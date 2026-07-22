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
		}
	];

	let { class: className, title = 'Latest Articles', description = 'Explore our recent posts and insights', posts = defaultPosts, eyebrow = 'Blog Section' }: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div>
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
					<h3 class="mt-2 text-lg font-semibold leading-snug">{post.title}</h3>
					{#if post.excerpt}
						<p class="mt-2 text-sm text-muted-foreground flex-1">{post.excerpt}</p>
					{/if}
					{#if post.author}
						<div class="mt-4 flex items-center gap-3">
							<div class="h-8 w-8 rounded-full bg-muted flex-shrink-0"></div>
							<div class="min-w-0">
								<p class="text-sm font-medium truncate">{post.author.name}</p>
								{#if post.author.role}
									<p class="text-xs text-muted-foreground truncate">{post.author.role}</p>
								{/if}
							</div>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	</div>
</section>
