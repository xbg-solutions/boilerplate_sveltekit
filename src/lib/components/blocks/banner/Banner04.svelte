<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		count?: string;
		label?: string;
		variant?: 'light' | 'dark';
		href?: string;
	}

	let {
		class: className,
		count = '5K+',
		label = 'Loved by',
		variant = 'light',
		href
	}: Props = $props();

	const isLight = variant === 'light';
	const containerClass = isLight
		? 'inline-flex items-center gap-3 rounded-full border bg-background px-4 py-2'
		: 'inline-flex items-center gap-3 rounded-full border border-background/20 bg-foreground text-background px-4 py-2';
</script>

<a
	{href}
	class={cn(containerClass, className)}
	role={href ? 'link' : 'status'}
>
	<div class="flex -space-x-2">
		{#each [0, 1, 2] as index}
			<div
				class={cn(
					'h-8 w-8 rounded-full',
					isLight ? 'bg-muted' : 'bg-background/30'
				)}
			></div>
		{/each}
	</div>

	<span class="text-sm font-medium">
		{label} <strong>{count}</strong> customers
	</span>

	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
		<polyline points="9 18 15 12 9 6"></polyline>
	</svg>
</a>
