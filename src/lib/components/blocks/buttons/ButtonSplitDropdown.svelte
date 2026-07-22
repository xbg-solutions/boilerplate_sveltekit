<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		label?: string;
		onclick?: () => void;
		onDropdown?: () => void;
		open?: boolean;
	}

	const { class: className = '', label = 'Publish', onclick, onDropdown, open = false } = $props();

	// svelte-ignore state_referenced_locally
	let isOpen = $state(open);

	const handleDropdown = () => {
		isOpen = !isOpen;
		onDropdown?.();
	};
</script>

<div class={cn('inline-flex rounded-md border overflow-hidden', className)}>
	<button
		type="button"
		onclick={onclick}
		class="flex items-center gap-2 px-3 py-1.5 text-sm bg-background hover:bg-muted transition-colors"
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
			<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
		</svg>
		<span>{label}</span>
	</button>

	<div class="border-l"></div>

	<button
		type="button"
		aria-label="Open dropdown menu"
		onclick={handleDropdown}
		class="flex items-center px-2 py-1.5 bg-background hover:bg-muted transition-colors"
	>
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m6 9 6 6 6-6" />
		</svg>
	</button>
</div>
