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
		userCount?: string;
	}

	let {
		class: className,
		title = 'Join Thousands Building Tomorrow',
		subtitle = 'Collaborate, create, and ship faster than ever before.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Schedule demo',
		onPrimary,
		onSecondary,
		userCount = '50,000+',
	}: Props = $props();
</script>

<section class={cn('w-full bg-white px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Left Content -->
			<div>
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
					{title}
				</h1>
				<p class="mt-6 text-lg text-gray-600 max-w-xl">
					{subtitle}
				</p>

				<!-- CTA Buttons -->
				<div class="mt-8 flex flex-col sm:flex-row gap-4">
					<Button size="lg" onclick={onPrimary}>
						{primaryLabel}
					</Button>
					<Button variant="outline" size="lg" onclick={onSecondary}>
						{secondaryLabel}
					</Button>
				</div>

				<!-- Social Proof with Avatars -->
				<div class="mt-10 flex items-center gap-3 pt-8 border-t border-gray-200">
					<div class="flex -space-x-3">
						<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							A
						</div>
						<div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							B
						</div>
						<div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							C
						</div>
						<div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							D
						</div>
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-900">
							Join <strong>{userCount}</strong> users
						</p>
						<p class="text-xs text-gray-600">Already growing with us</p>
					</div>
				</div>
			</div>

			<!-- Right Screenshot -->
			<div class="relative">
				<div class="relative rounded-2xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform">
					<div class="aspect-square w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300">
						<svg
							width="64"
							height="64"
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

				<!-- Floating accent card -->
				<div class="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-xl border border-gray-200">
					<p class="text-xs font-semibold text-gray-900">Featured by</p>
					<p class="text-sm text-gray-600 mt-1">TechCrunch</p>
				</div>
			</div>
		</div>
	</div>
</section>
