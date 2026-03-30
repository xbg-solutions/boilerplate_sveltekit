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
		imageUrl?: string;
	}

	let {
		class: className,
		title = 'Build your next big idea faster',
		subtitle = 'A comprehensive toolkit that helps you design, develop, and ship production-ready products at lightning speed.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
		imageUrl,
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
				{#if imageUrl}
					<img src={imageUrl} alt="Hero" class="w-full rounded-xl shadow-2xl" />
				{:else}
					<div
						class="aspect-video w-full rounded-xl bg-muted flex items-center justify-center shadow-2xl"
					>
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1"
							class="text-muted-foreground/40"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
