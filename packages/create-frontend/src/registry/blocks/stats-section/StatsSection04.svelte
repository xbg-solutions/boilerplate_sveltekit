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
			label: 'Stat title',
			value: '2,400%',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		},
		{
			label: 'Stat title',
			value: '$410K',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		},
		{
			label: 'Stat title',
			value: '11,000',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		}
	];

	let { class: className = '', title = 'Data-driven highlights that showcase impact', description = 'Add a concise value statement that explains how your metrics demonstrate success and growth. Focus on transformation and measurable outcomes.', stats = defaultStats }: Props = $props();
</script>

<section class={cn("w-full bg-background py-16 px-4 sm:px-6 lg:px-8", className)}>
	<div class="mx-auto max-w-6xl">
		<div>
			<p class="text-xs uppercase tracking-widest text-muted-foreground">Stats Section</p>
			<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
				{title}
			</h2>
			<p class="mt-3 text-sm text-muted-foreground max-w-lg">
				{description}
			</p>
		</div>

		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each stats as stat (stat.value)}
				<div class="rounded-lg border bg-background p-6">
					<p class="text-xs font-medium text-muted-foreground">
						{stat.label || 'Stat title'}
					</p>
					<p class="mt-1 text-3xl font-bold">
						{stat.value}
					</p>
					<p class="mt-2 text-sm text-muted-foreground">
						{stat.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
