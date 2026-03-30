<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface BentoCard {
		icon: string;
		title: string;
		description: string;
		size: 'large' | 'medium' | 'small';
	}

	interface Props {
		class?: string;
		heading?: string;
		cards?: BentoCard[];
	}

	const defaultCards: BentoCard[] = [
		{
			icon: 'zap',
			title: 'Lightning Fast',
			description: 'Blazing speeds with optimized performance.',
			size: 'large',
		},
		{
			icon: 'palette',
			title: 'Beautiful Design',
			description: 'Stunning interfaces out of the box.',
			size: 'medium',
		},
		{
			icon: 'shield',
			title: 'Secure',
			description: 'Enterprise security.',
			size: 'medium',
		},
		{
			icon: 'code',
			title: 'Developer Friendly',
			description: 'Easy to build with.',
			size: 'small',
		},
		{
			icon: 'users',
			title: 'Team Tools',
			description: 'Collaborate seamlessly.',
			size: 'small',
		},
		{
			icon: 'trending-up',
			title: 'Scalable',
			description: 'Grows with you.',
			size: 'small',
		},
	];

	let {
		class: className,
		heading = 'Designed for Every Use Case',
		cards = defaultCards,
	}: Props = $props();

	const iconPaths: Record<string, string> = {
		zap: 'm13 2-2 6.5h5l-7 13.5 2-6.5H6l7-13.5z',
		palette:
			'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
		shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
		code: 'M16 18 22 12 16 6M8 6 2 12 8 18',
		users: 'M17 21h-5v-2h5v2zM16 5.76A2.5 2.5 0 0 0 13.5 3 2.5 2.5 0 0 0 11 5.5 2.5 2.5 0 0 0 13.5 8 2.5 2.5 0 0 0 16 5.76zM8 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
		'trending-up': 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 9 12.41l4 4 6.3-6.29L22 12v-6z',
	};

	function getGridClasses(size: string): string {
		switch (size) {
			case 'large':
				return 'sm:col-span-2 sm:row-span-2';
			case 'medium':
				return 'sm:col-span-1';
			default:
				return 'sm:col-span-1';
		}
	}
</script>

<section class={cn('w-full bg-gray-50 py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-center mb-12">
			{heading}
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 auto-rows-max">
			{#each cards as card}
				<div
					class={cn(
						'p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow',
						getGridClasses(card.size)
					)}
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
							{#if iconPaths[card.icon]}
								<path d={iconPaths[card.icon]} />
							{:else}
								<circle cx="12" cy="12" r="3" />
							{/if}
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
					<p class="text-gray-600 text-sm">{card.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
