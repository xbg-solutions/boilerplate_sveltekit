<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		message?: string;
		ctaLabel?: string;
		onCta?: () => void;
	}

	let {
		class: className,
		message = 'New update · Pro blocks are now available in shadcn/ui kit for Figma!',
		ctaLabel,
		onCta
	}: Props = $props();

	let visible = $state(true);

	const handleClose = () => {
		visible = false;
	};

	const handleCta = () => {
		if (onCta) {
			onCta();
		}
	};
</script>

{#if visible}
	<div class={cn('inline-flex items-center gap-2 rounded-lg bg-foreground text-background text-sm px-4 py-3 w-full sm:w-auto relative', className)}>
		<p>
			<strong>{message.split('·')[0].trim()}</strong> · {message.split('·')[1]?.trim() || message} <span class="font-medium">»</span>
		</p>
		<button
			onclick={handleClose}
			class="absolute right-3 top-1/2 -translate-y-1/2 text-background/70 hover:text-background transition-colors"
			aria-label="Close banner"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>
{/if}
