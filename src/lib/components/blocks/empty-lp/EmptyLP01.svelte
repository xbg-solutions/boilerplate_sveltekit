<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	const {
		class: className,
		title = 'No data yet',
		description = 'Start creating your first item to see it appear here.',
		primaryLabel = 'Create now',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-24 px-4 text-center', className)}>
	<div class="mx-auto flex flex-col items-center gap-6">
		<div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
			<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path
					d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
				/>
			</svg>
		</div>

		<div>
			<h2 class="text-2xl font-bold">{title}</h2>
			<p class="mt-2 text-muted-foreground max-w-sm mx-auto">{description}</p>
		</div>

		<div class="flex gap-3">
			<Button onclick={onPrimary}>{primaryLabel}</Button>
			<Button variant="outline" onclick={onSecondary}>{secondaryLabel}</Button>
		</div>
	</div>
</section>
