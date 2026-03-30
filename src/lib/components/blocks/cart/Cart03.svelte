<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	function ShoppingBagIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
	}
</script>

<div class={cn('flex flex-col items-center justify-center min-h-screen bg-background', className)}>
	<div class="text-center space-y-6 px-4">
		<!-- Icon -->
		<div class="flex justify-center text-muted-foreground">
			{@html ShoppingBagIcon()}
		</div>

		<!-- Heading -->
		<div>
			<h1 class="text-3xl font-bold mb-2">Your cart is empty</h1>
			<p class="text-muted-foreground text-lg">
				Looks like you haven't added anything yet. Start shopping to fill your cart!
			</p>
		</div>

		<!-- CTA Button -->
		<div class="pt-4">
			<Button size="lg">
				Continue shopping
			</Button>
		</div>
	</div>
</div>
