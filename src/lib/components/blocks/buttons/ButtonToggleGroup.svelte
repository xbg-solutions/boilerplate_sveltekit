<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		options?: string[];
		value?: string;
		onchange?: (value: string) => void;
	}

	const defaultOptions = ['Today', 'This week', 'This month', 'This year'];
	const { class: className = '', options = defaultOptions, value, onchange } = $props();

	// svelte-ignore state_referenced_locally
	let selected = $state(value || options[0]);

	const handleSelect = (option: string) => {
		selected = option;
		onchange?.(option);
	};
</script>

<div class={cn('inline-flex rounded-md border overflow-hidden divide-x', className)}>
	{#each options as option (option)}
		<button
			type="button"
			onclick={() => handleSelect(option)}
			class={cn(
				'px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors',
				selected === option && 'bg-muted font-medium'
			)}
		>
			{option}
		</button>
	{/each}
</div>
