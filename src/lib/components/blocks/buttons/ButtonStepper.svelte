<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		onchange?: (value: number) => void;
	}

	const { class: className = '', value = 22, min = 0, max, step = 1, onchange } = $props();

	// svelte-ignore state_referenced_locally
	let count = $state(value);

	const handleMinus = () => {
		const newValue = Math.max(min, count - step);
		count = newValue;
		onchange?.(newValue);
	};

	const handlePlus = () => {
		const newValue = max !== undefined ? Math.min(max, count + step) : count + step;
		count = newValue;
		onchange?.(newValue);
	};
</script>

<div class={cn('inline-flex items-center rounded-md border bg-background', className)}>
	<button
		type="button"
		onclick={handleMinus}
		disabled={count <= min}
		aria-label="Decrease value"
		class="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
	>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>

	<span class="px-3 text-sm font-medium min-w-[2rem] text-center">{count}</span>

	<button
		type="button"
		onclick={handlePlus}
		disabled={max !== undefined && count >= max}
		aria-label="Increase value"
		class="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
	>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>
</div>
