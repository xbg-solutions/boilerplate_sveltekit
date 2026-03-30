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
	}

	let {
		class: className,
		title = 'Build your next big idea faster',
		subtitle = 'A comprehensive toolkit that helps you design, develop, and ship production-ready products at lightning speed.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
	}: Props = $props();
</script>

<section
	class={cn(
		'w-full bg-gradient-to-br from-background via-background to-muted px-4 py-20 sm:py-28 sm:px-6 lg:px-8',
		className
	)}
>
	<div class="mx-auto max-w-6xl">
		<div class="text-center">
			<h1
				class="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
			>
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
	</div>
</section>
