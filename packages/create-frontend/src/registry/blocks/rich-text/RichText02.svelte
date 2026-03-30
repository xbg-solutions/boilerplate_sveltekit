<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Section {
		heading: string;
		content: string;
	}

	interface Props {
		class?: string;
		title?: string;
		sections?: Section[];
	}

	const {
		class: className,
		title = 'Documentation',
		sections = [
			{
				heading: 'Introduction',
				content:
					'Welcome to our comprehensive guide. This document covers everything you need to get started.'
			},
			{
				heading: 'Features',
				content:
					'Discover the powerful features that set our platform apart. Learn what you can achieve with our tools.'
			},
			{
				heading: 'Getting Started',
				content:
					'Follow our step-by-step guide to set up your account and start using our platform immediately.'
			}
		]
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-6xl">
		<h1 class="text-3xl font-bold">{title}</h1>
		<div class="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-[200px_1fr]">
			<nav class="flex flex-col gap-0">
				<ul class="space-y-2 text-sm">
					{#each sections as section}
						<li>
							<a
								href="#{section.heading.toLowerCase().replace(/\s+/g, '-')}"
								class="text-muted-foreground hover:text-foreground transition-colors"
							>
								{section.heading}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="space-y-8">
				{#each sections as section}
					<div>
						<h2
							id={section.heading.toLowerCase().replace(/\s+/g, '-')}
							class="text-2xl font-bold mb-4"
						>
							{section.heading}
						</h2>
						<p class="text-muted-foreground leading-7">{section.content}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
