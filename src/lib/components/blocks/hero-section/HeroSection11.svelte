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

<section
	class={cn('relative w-full min-h-[600px] bg-foreground overflow-hidden flex items-center px-4 py-20 sm:px-6 lg:px-8', className)}
>
	<div class="absolute inset-0 bg-foreground/70"></div>

	{#if imageUrl}
		<img src={imageUrl} alt="Hero background" class="absolute inset-0 w-full h-full object-cover" />
	{:else}
		<div class="absolute inset-0 bg-muted"></div>
	{/if}

	<div class="relative z-10 mx-auto max-w-6xl w-full">
		<div class="text-center">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-background">
				{title}
			</h1>
			<p class="mt-4 text-lg text-background/90 max-w-2xl mx-auto">
				{subtitle}
			</p>
			<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
				<Button size="lg" variant="secondary" onclick={onPrimary}>{primaryLabel}</Button>
				<Button
					size="lg"
					variant="outline"
					onclick={onSecondary}
					class="border-background/30 text-background hover:bg-background/10"
				>
					{secondaryLabel}
				</Button>
			</div>
		</div>
	</div>
</section>
