<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		isOpen?: boolean;
		onClose?: () => void;
	}

	const { class: className, isOpen = true, onClose }: Props = $props();

	interface CartItem {
		id: number;
		name: string;
		price: number;
		quantity: number;
	}

	let cartItems = $state<CartItem[]>([
		{ id: 1, name: 'Wireless Headphones', price: 129.99, quantity: 1 },
		{ id: 2, name: 'USB-C Cable', price: 19.99, quantity: 2 },
		{ id: 3, name: 'Phone Case', price: 24.99, quantity: 1 }
	]);

	let subtotal = $derived(
		cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

	function removeItem(id: number) {
		cartItems = cartItems.filter((item) => item.id !== id);
	}

	function XIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
	}

	function TrashIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/50 z-40"
		role="presentation"
		onclick={onClose}
	></div>

	<!-- Slide-over Panel -->
	<div class={cn('fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col', className)}>
		<!-- Header -->
		<div class="flex items-center justify-between border-b px-6 py-4">
			<h2 class="text-lg font-semibold">Your cart ({cartItems.length})</h2>
			<button
				onclick={onClose}
				class="p-2 hover:bg-gray-100 rounded transition"
				aria-label="Close cart"
			>
				{@html XIcon()}
			</button>
		</div>

		<!-- Items List -->
		<div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
			{#each cartItems as item (item.id)}
				<div class="flex gap-4 pb-4 border-b">
					<div class="aspect-square w-16 h-16 bg-gray-100 rounded flex-shrink-0">
					</div>
					<div class="flex-1 min-w-0">
						<p class="font-medium text-sm">{item.name}</p>
						<p class="text-sm text-gray-600">Qty: {item.quantity}</p>
						<p class="font-semibold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
					</div>
					<button
						onclick={() => removeItem(item.id)}
						class="p-2 hover:bg-red-50 text-red-600 rounded transition flex-shrink-0"
						aria-label="Remove item"
					>
						{@html TrashIcon()}
					</button>
				</div>
			{/each}
		</div>

		<!-- Footer -->
		<div class="border-t px-6 py-4 space-y-4">
			<div class="flex justify-between font-semibold text-base">
				<span>Subtotal</span>
				<span>${subtotal.toFixed(2)}</span>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<Button variant="outline" class="w-full">
					View cart
				</Button>
				<Button class="w-full">
					Checkout
				</Button>
			</div>
		</div>
	</div>
{/if}
