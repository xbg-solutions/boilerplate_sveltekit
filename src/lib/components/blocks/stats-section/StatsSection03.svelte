<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Stat {
		label?: string;
		value: string;
		description?: string;
	}

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		stats?: Stat[];
	}

	const defaultStats: Stat[] = [
		{
			value: '42,263',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		},
		{
			value: '$23M',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		}
	];

	let { class: className = '', title = 'Data-driven highlights that showcase impact', description = 'Add a concise value statement that explains how your metrics demonstrate success and growth. Focus on transformation and measurable outcomes.', stats = defaultStats }: Props = $props();
</script>

<section class={cn("w-full bg-background py-16 px-4 sm:px-6 lg:px-8", className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
			<div class="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
			</div>

			<div>
				<p class="text-xs uppercase tracking-widest text-muted-foreground">Stats Section</p>
				<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
					{title}
				</h2>
				<p class="mt-3 text-sm text-muted-foreground max-w-lg">
					{description}
				</p>

				<div class="mt-6 grid grid-cols-2 gap-6">
					{#each stats as stat (stat.value)}
						<div>
							<p class="text-4xl font-bold">
								{stat.value}
							</p>
							<p class="text-sm text-muted-foreground mt-2">
								{stat.description}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
