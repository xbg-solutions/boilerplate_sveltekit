<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Stat {
		value: string;
		label: string;
	}

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		stats?: Stat[];
	}

	let {
		class: className,
		title = 'By The Numbers',
		subtitle = 'See the impact we make',
		stats = [
			{ value: '10K+', label: 'Active Users' },
			{ value: '500M', label: 'Transactions' },
			{ value: '99.9%', label: 'Uptime' }
		]
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:py-24', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
			<div class="flex-1">
				{#if title}
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-3">{title}</h1>
				{/if}

				{#if subtitle}
					<p class="text-lg text-muted-foreground">{subtitle}</p>
				{/if}
			</div>

			{#if stats && stats.length > 0}
				<div class="flex flex-wrap gap-8 lg:justify-end">
					{#each stats as stat}
						<div class="flex flex-col">
							<p class="text-4xl sm:text-5xl font-bold mb-1">{stat.value}</p>
							<p class="text-sm text-muted-foreground">{stat.label}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
