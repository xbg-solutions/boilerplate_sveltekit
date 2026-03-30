<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
	}

	let { class: customClass = '', title = 'Build something amazing', description = '' }: Props = $props();

	const stats = [
		{ value: '99.9%', label: 'Uptime', description: 'Industry-leading reliability' },
		{ value: '10ms', label: 'Latency', description: 'Lightning-fast response times' },
		{ value: '∞', label: 'Scale', description: 'Unlimited scalability' },
		{ value: 'Advanced', label: 'Security', description: 'Enterprise protection' },
		{ value: 'Yes', label: 'API', description: 'Full REST API included' },
		{ value: '24/7', label: 'Support', description: 'Round-the-clock assistance' }
	];
</script>

<section class={cn('w-full py-16 px-4 sm:px-6', customClass)}>
	<div class="mx-auto max-w-7xl">
		<div class="text-center mb-12">
			<p class="text-sm font-semibold text-foreground/60 mb-2">Bento Grid</p>
			<h2 class="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
			{#if description}
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
			{/if}
		</div>

		<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each stats as stat}
				<div class="rounded-xl border bg-background p-6">
					<div class="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
					<h3 class="font-semibold text-lg">{stat.label}</h3>
					<p class="text-sm text-muted-foreground mt-2">{stat.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
