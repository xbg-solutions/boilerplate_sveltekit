<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		breadcrumbs?: { label: string; href?: string }[];
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		breadcrumbs = [
			{ label: 'Home', href: '/' },
			{ label: 'Section', href: '#' },
			{ label: 'Current Page' }
		],
		title = 'Page Title',
		subtitle = 'Descriptive subtitle for the page',
		primaryLabel = 'Primary Action',
		secondaryLabel = 'Secondary Action',
		onPrimary,
		onSecondary
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:py-24', className)}>
	<div class="mx-auto max-w-5xl">
		{#if breadcrumbs && breadcrumbs.length > 0}
			<nav class="mb-8 flex items-center gap-2 text-sm">
				{#each breadcrumbs as crumb, i}
					<a href={crumb.href || '#'} class="text-muted-foreground hover:text-foreground transition">
						{crumb.label}
					</a>
					{#if i < breadcrumbs.length - 1}
						<span class="text-muted-foreground">/</span>
					{/if}
				{/each}
			</nav>
		{/if}

		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
			<div class="flex-1">
				{#if title}
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-3">{title}</h1>
				{/if}

				{#if subtitle}
					<p class="text-lg text-muted-foreground">{subtitle}</p>
				{/if}
			</div>

			<div class="flex flex-col sm:flex-row gap-3 lg:flex-col lg:items-end">
				<Button onclick={onPrimary} size="lg">
					{primaryLabel}
				</Button>
				<Button onclick={onSecondary} variant="outline" size="lg">
					{secondaryLabel}
				</Button>
			</div>
		</div>
	</div>
</section>
