<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		onClear?: () => void;
	}

	const {
		class: className,
		title = 'No results found',
		description = 'Try adjusting your search or filters to find what you are looking for.',
		onClear
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-24 px-4 text-center', className)}>
	<div class="mx-auto flex flex-col items-center gap-6">
		<div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
			<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
				<line x1="8" y1="11" x2="14" y2="11" />
			</svg>
		</div>

		<div>
			<h2 class="text-2xl font-bold">{title}</h2>
			<p class="mt-2 text-muted-foreground max-w-sm mx-auto">{description}</p>
		</div>

		<Button variant="outline" onclick={onClear}>Clear filters</Button>
	</div>
</section>
