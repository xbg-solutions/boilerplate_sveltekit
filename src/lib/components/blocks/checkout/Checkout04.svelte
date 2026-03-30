<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	const orderNumber = 'ORD-2024-789456';
	const estimatedDelivery = 'April 5, 2026';
	const orderDate = 'March 31, 2026';

	function CheckmarkIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
	}
</script>

<div class={cn('flex flex-col items-center justify-center min-h-screen bg-background px-4', className)}>
	<div class="w-full max-w-2xl text-center space-y-8">
		<!-- Checkmark Circle -->
		<div class="flex justify-center">
			<div class="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center text-green-600">
				{@html CheckmarkIcon()}
			</div>
		</div>

		<!-- Confirmation Message -->
		<div class="space-y-2">
			<h1 class="text-4xl font-bold">Order Confirmed</h1>
			<p class="text-muted-foreground text-lg">Thank you for your purchase!</p>
		</div>

		<!-- Order Details -->
		<div class="rounded-lg border bg-background p-8 space-y-6 text-left">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-muted-foreground mb-1">Order number</p>
					<p class="text-lg font-semibold font-mono">{orderNumber}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground mb-1">Order date</p>
					<p class="text-lg font-semibold">{orderDate}</p>
				</div>
			</div>

			<!-- Items Summary -->
			<div class="border-t pt-6">
				<h2 class="font-semibold mb-4">Order Items</h2>
				<div class="space-y-3">
					<div class="flex justify-between py-2">
						<span>Wireless Headphones x 1</span>
						<span class="font-semibold">$129.99</span>
					</div>
					<div class="flex justify-between py-2">
						<span>Phone Case x 1</span>
						<span class="font-semibold">$24.99</span>
					</div>
				</div>
			</div>

			<!-- Totals -->
			<div class="border-t pt-6 space-y-2">
				<div class="flex justify-between text-muted-foreground">
					<span>Subtotal</span>
					<span>$154.98</span>
				</div>
				<div class="flex justify-between text-muted-foreground">
					<span>Shipping</span>
					<span>FREE</span>
				</div>
				<div class="flex justify-between text-muted-foreground">
					<span>Tax</span>
					<span>$15.01</span>
				</div>
				<div class="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
					<span>Total paid</span>
					<span>$154.99</span>
				</div>
			</div>

			<!-- Delivery Info -->
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<p class="text-sm text-blue-900">
					<span class="font-semibold">Estimated delivery:</span> {estimatedDelivery}
				</p>
				<p class="text-sm text-blue-800 mt-1">
					A tracking link will be sent to your email shortly.
				</p>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<Button size="lg">
				Track your order
			</Button>
			<Button variant="outline" size="lg">
				Continue shopping
			</Button>
		</div>

		<!-- Confirmation Email -->
		<p class="text-sm text-muted-foreground">
			A confirmation email has been sent to <span class="font-semibold">customer@example.com</span>
		</p>
	</div>
</div>
