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
		onPlay?: () => void;
		videoUrl?: string;
	}

	let {
		class: className,
		title = 'Build your next big idea faster',
		subtitle = 'A comprehensive toolkit that helps you design, develop, and ship production-ready products at lightning speed.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
		onPlay,
		videoUrl,
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
				{title}
			</h1>
			<p class="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
				{subtitle}
			</p>
			<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
				<Button size="lg" onclick={onPrimary}>{primaryLabel}</Button>
				<Button variant="outline" size="lg" onclick={onSecondary}>{secondaryLabel}</Button>
			</div>
		</div>

		<div class="mt-16 relative">
			<div class="mx-auto max-w-4xl">
				<div class="relative aspect-video w-full rounded-xl bg-muted flex items-center justify-center shadow-2xl overflow-hidden">
					{#if videoUrl}
						<video
							src={videoUrl}
							class="w-full h-full object-cover"
							controls
						></video>
					{:else}
						<div class="absolute inset-0 bg-muted"></div>
					{/if}

					<button
						onclick={onPlay}
						class="absolute inset-0 flex items-center justify-center hover:opacity-80 transition-opacity"
					>
						<div class="h-16 w-16 rounded-full bg-background/90 flex items-center justify-center shadow-lg hover:bg-background transition-colors">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="text-foreground ml-1"
							>
								<polygon points="5 3 19 12 5 21 5 3" />
							</svg>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
