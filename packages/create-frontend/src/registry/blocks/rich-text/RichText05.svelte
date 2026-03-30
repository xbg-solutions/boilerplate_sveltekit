<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		breadcrumbs?: string[];
		prevLabel?: string;
		nextLabel?: string;
		onPrev?: () => void;
		onNext?: () => void;
	}

	const {
		class: className,
		title = 'Getting Started',
		breadcrumbs = ['Home', 'Docs', 'Getting Started'],
		prevLabel = 'Previous',
		nextLabel = 'Next',
		onPrev,
		onNext
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-2xl">
		<nav class="flex text-sm text-muted-foreground gap-2 items-center">
			{#each breadcrumbs as crumb, i}
				<span>{crumb}</span>
				{#if i < breadcrumbs.length - 1}
					<span>/</span>
				{/if}
			{/each}
		</nav>

		<h1 class="mt-8 text-3xl font-bold tracking-tight">{title}</h1>
		<p class="mt-4 text-muted-foreground">This is the main content area. Add your documentation content here.</p>

		<div class="mt-8 space-y-4 text-base leading-7 text-muted-foreground">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</p>
			<p>
				Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
				commodo consequat.
			</p>
		</div>

		<div class="mt-12 flex justify-between border-t pt-6">
			<Button variant="outline" onclick={onPrev}>← {prevLabel}</Button>
			<Button variant="outline" onclick={onNext}>{nextLabel} →</Button>
		</div>
	</div>
</section>
