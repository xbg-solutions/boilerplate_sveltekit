<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
	}

	let {
		class: className,
		title = 'See It In Action',
		subtitle = 'Our intuitive interface makes it easy for teams to collaborate and ship faster.',
		primaryLabel = 'Get started',
		onPrimary,
	}: Props = $props();
</script>

<section class={cn('w-full bg-white px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
				{title}
			</h1>
			<p class="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
				{subtitle}
			</p>
		</div>

		<!-- Side-by-Side Screenshots -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
			<div class="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
				<div class="aspect-video w-full rounded-2xl bg-gray-100 flex items-center justify-center">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						class="text-gray-400"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
				</div>
			</div>
			<div class="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
				<div class="aspect-video w-full rounded-2xl bg-gray-100 flex items-center justify-center">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						class="text-gray-400"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
				</div>
			</div>
		</div>

		<!-- CTA Button -->
		<div class="text-center">
			<Button size="lg" onclick={onPrimary}>
				{primaryLabel}
			</Button>
		</div>
	</div>
</section>
