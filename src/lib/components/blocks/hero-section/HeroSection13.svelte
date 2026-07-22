<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		announcementText?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		announcementText = 'New: AI-powered features →',
		title = 'Announce Your Latest Feature',
		subtitle = 'Capture attention with a sleek dark hero that highlights your newest innovation. Perfect for product launches and feature announcements.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
	}: Props = $props();
</script>

<section class={cn('w-full bg-gray-950 px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center">
			<!-- Announcement Pill -->
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-4 py-2">
				<span class="text-sm font-medium text-white">✨ {announcementText}</span>
			</div>

			<!-- Headline -->
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
				{title}
			</h1>

			<!-- Subtitle -->
			<p class="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
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
					class="border-gray-700 text-white hover:bg-gray-900"
				>
					{secondaryLabel}
				</Button>
			</div>
		</div>

		<!-- Screenshot Mockup -->
		<div class="mt-16 relative">
			<div class="mx-auto max-w-5xl">
				<div
					class="relative aspect-video w-full rounded-2xl bg-gray-800 flex items-center justify-center shadow-2xl border border-gray-700 overflow-hidden"
				>
					<div class="absolute inset-0 bg-gradient-to-b from-gray-700/20 to-transparent"></div>
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
		</div>
	</div>
</section>
