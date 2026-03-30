<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
	}

	let { class: customClass = '', title = 'Build something amazing', description = '' }: Props = $props();

	const features = [
		{ name: 'Analytics', icon: '📊' },
		{ name: 'Security', icon: '🔒' },
		{ name: 'Performance', icon: '⚡' },
		{ name: 'Integrations', icon: '🔗' },
		{ name: 'Support', icon: '💬' },
		{ name: 'API', icon: '🔌' }
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
			{#each features as feature}
				<div class="rounded-xl border bg-background p-6">
					<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-foreground/10 mb-4 text-xl">
						{feature.icon}
					</div>
					<h3 class="font-semibold">{feature.name}</h3>
					<p class="text-sm text-muted-foreground mt-2">
						{#if feature.name === 'Analytics'}
							Track metrics and gain insights into user behavior.
						{:else if feature.name === 'Security'}
							Enterprise-grade security with encryption.
						{:else if feature.name === 'Performance'}
							Lightning-fast speed and optimized performance.
						{:else if feature.name === 'Integrations'}
							Connect with your favorite tools seamlessly.
						{:else if feature.name === 'Support'}
							24/7 customer support for all your needs.
						{:else if feature.name === 'API'}
							Complete API documentation and examples.
						{/if}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
