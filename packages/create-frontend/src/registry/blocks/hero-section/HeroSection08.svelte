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

<section class={cn('w-full bg-background px-0 py-0 sm:px-0 lg:px-0', className)}>
	<div class="grid grid-cols-1 sm:grid-cols-2 min-h-[600px]">
		<div class="bg-foreground text-background p-12 flex flex-col justify-center">
			<h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
				{title}
			</h1>
			<p class="mt-4 text-lg text-background/80">
				{subtitle}
			</p>
		</div>

		<div class="bg-background p-12 flex flex-col justify-center">
			<div class="space-y-4 mb-8">
				<p class="text-muted-foreground">
					{subtitle}
				</p>
			</div>
			<div class="flex flex-col gap-3">
				<Button size="lg" onclick={onPrimary}>{primaryLabel}</Button>
				<Button variant="outline" size="lg" onclick={onSecondary}>{secondaryLabel}</Button>
			</div>

			{#if imageUrl}
				<img src={imageUrl} alt="Hero" class="mt-8 w-full rounded-lg" />
			{:else}
				<div
					class="mt-8 aspect-video w-full rounded-lg bg-muted flex items-center justify-center"
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
</section>
