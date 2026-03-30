<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		open?: boolean;
		onToggle?: (open: boolean) => void;
	}

	const { class: className = '', open = false, onToggle } = $props();

	let isOpen = $state(open);

	const handleToggle = () => {
		isOpen = !isOpen;
		onToggle?.(isOpen);
	};
</script>

<button
	type="button"
	onclick={handleToggle}
	class={cn('flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors', className)}
>
	{#if isOpen}
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	{:else}
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="3" y1="6" x2="21" y2="6" />
			<line x1="3" y1="12" x2="21" y2="12" />
			<line x1="3" y1="18" x2="21" y2="18" />
		</svg>
	{/if}
</button>
