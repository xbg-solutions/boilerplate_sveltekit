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
	<!-- Desktop -->
	<div class="hidden sm:flex w-full bg-foreground text-background text-sm px-6 py-3 items-center justify-between">
		<p class="text-center flex-1">{message}</p>
		<button
			onclick={handleClose}
			class="text-background/70 hover:text-background transition-colors flex-shrink-0"
			aria-label="Close banner"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>

	<!-- Mobile -->
	<div class="sm:hidden rounded-lg bg-foreground text-background p-4 text-sm flex items-start justify-between gap-3">
		<p class="flex-1">{message}</p>
		<button
			onclick={handleClose}
			class="text-background/70 hover:text-background transition-colors flex-shrink-0 mt-0.5"
			aria-label="Close banner"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>
{/if}
