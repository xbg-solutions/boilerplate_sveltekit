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
		trustCount?: string;
	}

	let {
		class: className,
		title = 'Build your next big idea faster',
		subtitle = 'A comprehensive toolkit that helps you design, develop, and ship production-ready products at lightning speed.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
		trustCount = 'Trusted by 10,000+ teams',
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div>
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
				{title}
			</h1>
			<p class="mt-4 text-lg text-muted-foreground max-w-2xl">
				{subtitle}
			</p>
			<div class="mt-8 flex flex-col sm:flex-row gap-3">
				<Button size="lg" onclick={onPrimary}>{primaryLabel}</Button>
				<Button variant="outline" size="lg" onclick={onSecondary}>{secondaryLabel}</Button>
			</div>

			<div class="mt-6 flex items-center gap-3">
				<div class="flex -space-x-2">
					{#each Array(3) as _, i}
						<div
							class="h-8 w-8 rounded-full bg-gradient-to-br from-muted to-muted-foreground flex items-center justify-center text-xs font-bold text-background ring-2 ring-background"
						>
							{String.fromCharCode(65 + i)}
						</div>
					{/each}
				</div>
				<span class="text-sm text-muted-foreground">{trustCount}</span>
			</div>
		</div>
	</div>
</section>
