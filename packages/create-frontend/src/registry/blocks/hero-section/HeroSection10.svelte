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
		'w-full min-h-screen bg-background px-4 pb-20 flex flex-col justify-end sm:px-6 lg:px-8',
		className
	)}
	style="background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 20px 20px;"
>
	<div class="mx-auto max-w-6xl w-full">
		<div>
			<h1 class="text-5xl sm:text-7xl font-black tracking-tight">
				{title}
			</h1>
			<p class="mt-4 text-lg text-muted-foreground max-w-2xl">
				{subtitle}
			</p>
			<div class="mt-8 flex flex-col sm:flex-row gap-3">
				<Button size="lg" onclick={onPrimary}>{primaryLabel}</Button>
				<Button variant="outline" size="lg" onclick={onSecondary}>{secondaryLabel}</Button>
			</div>
		</div>
	</div>
</section>
