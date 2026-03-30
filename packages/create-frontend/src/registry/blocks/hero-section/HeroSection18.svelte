<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
	}

	let {
		class: className,
		eyebrow = 'Product Overview',
		title = 'Everything You Need in One Platform',
		subtitle = 'Powerful features designed to streamline your workflow and boost productivity.',
		primaryLabel = 'Get started',
		onPrimary,
	}: Props = $props();

	const benefits = [
		'Comprehensive feature set',
		'Real-time collaboration',
		'Advanced analytics',
	];
</script>

<section class={cn('w-full bg-gray-950 px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Left Image -->
			<div>
				<div class="relative aspect-square w-full rounded-2xl bg-gray-800 flex items-center justify-center shadow-2xl border border-gray-700 overflow-hidden">
					<div class="absolute inset-0 bg-gradient-to-b from-gray-700/20 to-transparent" />
					<svg
						width="64"
						height="64"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						class="text-gray-600 relative z-10"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
				</div>
			</div>

			<!-- Right Content -->
			<div class="bg-gray-900 rounded-2xl p-8 border border-gray-800">
				<p class="text-sm font-semibold text-blue-400 uppercase tracking-wide">{eyebrow}</p>
				<h2 class="mt-4 text-3xl sm:text-4xl font-bold text-white">
					{title}
				</h2>
				<p class="mt-4 text-gray-400">
					{subtitle}
				</p>

				<!-- Bullet Points with Check Icons -->
				<ul class="mt-8 space-y-4">
					{#each benefits as benefit}
						<li class="flex items-center gap-3">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-green-500 flex-shrink-0">
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span class="text-gray-300">{benefit}</span>
						</li>
					{/each}
				</ul>

				<!-- CTA -->
				<Button size="lg" onclick={onPrimary} class="mt-8 w-full bg-white text-black hover:bg-gray-100">
					{primaryLabel}
				</Button>
			</div>
		</div>
	</div>
</section>
