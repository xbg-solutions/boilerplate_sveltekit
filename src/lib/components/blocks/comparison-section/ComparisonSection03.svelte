<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		beforeTitle?: string;
		afterTitle?: string;
		beforePoints?: string[];
		afterPoints?: string[];
	}

	let showAfter = $state(false);

	const {
		class: className,
		beforeTitle = 'Before',
		afterTitle = 'After',
		beforePoints = [
			'Manual processes taking hours',
			'Scattered data across systems',
			'Limited visibility into progress'
		],
		afterPoints = [
			'Automated workflows save time',
			'Centralized data repository',
			'Real-time insights and reporting'
		]
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-2xl">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold">See the difference</h2>

			<div class="mt-8 flex items-center justify-center gap-4">
				<p class={cn('text-sm font-semibold', !showAfter ? 'text-foreground' : 'text-muted-foreground')}>
					Before
				</p>
				<button
					aria-label="Toggle before and after comparison"
					onclick={() => (showAfter = !showAfter)}
					class={cn(
						'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
						showAfter ? 'bg-foreground' : 'bg-muted'
					)}
				>
					<span
						class={cn(
							'inline-block h-6 w-6 transform rounded-full bg-background transition-transform',
							showAfter ? 'translate-x-7' : 'translate-x-1'
						)}
					></span>
				</button>
				<p class={cn('text-sm font-semibold', showAfter ? 'text-foreground' : 'text-muted-foreground')}>
					After
				</p>
			</div>
		</div>

		<div class="space-y-6">
			{#if !showAfter}
				<div class="rounded-xl border border-red-200 bg-red-50/50 p-6">
					<h3 class="font-semibold text-red-900">{beforeTitle}</h3>
					<ul class="mt-4 space-y-2">
						{#each beforePoints as point}
							<li class="flex items-start gap-3">
								<svg class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
								<span class="text-red-900">{point}</span>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<div class="rounded-xl border border-green-200 bg-green-50/50 p-6">
					<h3 class="font-semibold text-green-900">{afterTitle}</h3>
					<ul class="mt-4 space-y-2">
						{#each afterPoints as point}
							<li class="flex items-start gap-3">
								<svg class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<polyline points="20 6 9 17 4 12" />
								</svg>
								<span class="text-green-900">{point}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</section>
