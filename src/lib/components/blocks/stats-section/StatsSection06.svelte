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
			value: '124%',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		},
		{
			value: '88%',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		},
		{
			value: '25%',
			description: 'Each stat should include a bold numerical figure followed by a brief, compelling description.'
		}
	];

	let { class: className = '', title, description, stats = defaultStats }: Props = $props();
</script>

<section class={cn("w-full bg-background py-12 px-4 sm:px-6 lg:px-8", className)}>
	<div class="mx-auto max-w-4xl grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
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
</section>
