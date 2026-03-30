<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	let {
		class: className = '',
		headline = 'Ready to transform your workflow?',
		onCta = () => {},
		onLearnMore = () => {}
	}: {
		class?: string;
		headline?: string;
		onCta?: () => void;
		onLearnMore?: () => void;
	} = $props();
</script>

<section class={cn('w-full bg-muted py-8 px-4', className)}>
	<div class="mx-auto max-w-5xl rounded-xl bg-foreground text-background px-6 py-10">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<!-- Left: Headline -->
			<h2 class="text-2xl font-bold">{headline}</h2>

			<!-- Right: Buttons -->
			<div class="flex gap-3 sm:flex-shrink-0 flex-col sm:flex-row">
				<Button
					size="sm"
					class="bg-background text-foreground hover:bg-background/90"
					onclick={onCta}
				>
					Get started
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="text-background hover:bg-background/10"
					onclick={onLearnMore}
				>
					Learn more
				</Button>
			</div>
		</div>
	</div>
</section>
