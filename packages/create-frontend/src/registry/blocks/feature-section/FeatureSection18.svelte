<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface FeatureWithQuote {
		icon: string;
		title: string;
		description: string;
		quote: string;
		author: string;
		avatar: string;
	}

	interface Props {
		class?: string;
		heading?: string;
		features?: FeatureWithQuote[];
	}

	const defaultFeatures: FeatureWithQuote[] = [
		{
			icon: 'lightning',
			title: 'Lightning Fast',
			description: 'Instant performance with optimized code.',
			quote: 'Fastest solution we have tried.',
			author: 'Sarah Chen',
			avatar: 'SC',
		},
		{
			icon: 'shield',
			title: 'Enterprise Security',
			description: 'Bank-level encryption and compliance.',
			quote: 'Our security team approved immediately.',
			author: 'Mike Johnson',
			avatar: 'MJ',
		},
		{
			icon: 'code',
			title: 'Developer Joy',
			description: 'Clean APIs and great documentation.',
			quote: 'Best developer experience ever.',
			author: 'Alex Rivera',
			avatar: 'AR',
		},
	];

	let {
		class: className,
		heading = 'Trusted by Developers',
		features = defaultFeatures,
	}: Props = $props();

	const iconPaths: Record<string, string> = {
		lightning: 'm13 2-2 6.5h5l-7 13.5 2-6.5H6l7-13.5z',
		shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
		code: 'M16 18 22 12 16 6M8 6 2 12 8 18',
	};
</script>

<section class={cn('w-full bg-gray-950 py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-white text-center mb-12">
			{heading}
		</h2>

		<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
			{#each features as feature}
				<div class="p-6 rounded-lg bg-gray-900 border border-gray-800">
					<!-- Icon -->
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 mb-4">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-400">
							{#if iconPaths[feature.icon]}
								<path d={iconPaths[feature.icon]} />
							{:else}
								<circle cx="12" cy="12" r="3" />
							{/if}
						</svg>
					</div>

					<!-- Feature Content -->
					<h3 class="text-lg font-semibold text-white mb-2">{feature.title}</h3>
					<p class="text-gray-400 text-sm mb-6">{feature.description}</p>

					<!-- Quote -->
					<div class="border-t border-gray-800 pt-6">
						<p class="text-sm text-gray-300 italic mb-4">"{feature.quote}"</p>
						<div class="flex items-center gap-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-bold">
								{feature.avatar}
							</div>
							<span class="text-sm font-medium text-white">{feature.author}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
