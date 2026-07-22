<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		title = 'Watch Your Productivity Soar',
		subtitle = 'See how our platform transforms the way teams collaborate and ship faster.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Watch demo',
		onPrimary,
		onSecondary,
	}: Props = $props();
</script>

<section
	class={cn(
		'relative w-full h-screen min-h-96 flex items-center justify-center overflow-hidden px-4',
		className
	)}
>
	<!-- Video Background with Overlay -->
	<div class="absolute inset-0 bg-gray-900">
		<div class="absolute inset-0 bg-black/60"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 text-center max-w-4xl mx-auto">
		<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
			{title}
		</h1>
		<p class="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
			{subtitle}
		</p>

		<!-- CTA Buttons -->
		<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
			<Button size="lg" onclick={onPrimary} class="bg-white text-black hover:bg-gray-100">
				{primaryLabel}
			</Button>
			<Button
				variant="outline"
				size="lg"
				onclick={onSecondary}
				class="border-white text-white hover:bg-white/10"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="mr-2"
				>
					<polygon points="5 3 19 12 5 21 5 3" />
				</svg>
				{secondaryLabel}
			</Button>
		</div>

		<!-- Additional Trust Text -->
		<p class="mt-8 text-sm text-gray-400">
			Join thousands of teams building the future
		</p>
	</div>
</section>
