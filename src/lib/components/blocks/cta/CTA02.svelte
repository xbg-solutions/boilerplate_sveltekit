<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	let {
		class: className = '',
		headline = 'Ready to get started?',
		onLearnMore = () => {},
		onCta = () => {}
	}: {
		class?: string;
		headline?: string;
		onLearnMore?: () => void;
		onCta?: () => void;
	} = $props();
</script>

<section
	class={cn('w-full bg-foreground text-background py-12 px-4', className)}
>
	<div class="mx-auto max-w-7xl">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<!-- Left: Headline -->
			<h2 class="text-2xl sm:text-3xl font-bold">
				{headline}
			</h2>

			<!-- Right: Buttons -->
			<div class="flex items-center gap-3 sm:flex-shrink-0">
				<Button
					variant="ghost"
					size="sm"
					class="text-background hover:bg-background/10"
					onclick={onLearnMore}
				>
					Learn more
				</Button>
				<Button
					size="sm"
					class="bg-background text-foreground hover:bg-background/90"
					onclick={onCta}
				>
					Get started
				</Button>
			</div>
		</div>
	</div>
</section>
