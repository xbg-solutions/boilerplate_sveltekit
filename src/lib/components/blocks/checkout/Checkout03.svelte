<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	let cardNumber = $state('');
	let cardholderName = $state('John Doe');
	let expiryMonth = $state('');
	let expiryYear = $state('');
	let cvv = $state('');

	const totalAmount = 154.99;

	function LockIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
	}

	function formatCardNumber(value: string): string {
		const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
		const matches = v.match(/\d{4,16}/g);
		const match = (matches && matches[0]) || '';
		const parts = [];

		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}

		if (parts.length) {
			return parts.join(' ');
		} else {
			return value;
		}
	}

	function handleCardInput(e: Event) {
		const input = e.target as HTMLInputElement;
		cardNumber = formatCardNumber(input.value);
	}
</script>

<div class={cn('space-y-8', className)}>
	<div>
		<h1 class="text-3xl font-bold">Payment</h1>
		<p class="text-muted-foreground mt-2">Enter your payment details to complete your order</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Payment Form -->
		<div class="lg:col-span-2">
			<div class="rounded-lg border bg-background p-8 space-y-6">
				<!-- Card Preview -->
				<div class="rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white aspect-video flex flex-col justify-between">
					<div class="text-lg font-light tracking-widest">
						{cardNumber || '•••• •••• •••• ••••'}
					</div>
					<div class="flex justify-between items-end">
						<div>
							<p class="text-xs opacity-75 mb-1">Card holder</p>
							<p class="font-semibold">{cardholderName || 'YOUR NAME'}</p>
						</div>
						<div class="text-right">
							<p class="text-xs opacity-75 mb-1">Expires</p>
							<p class="font-semibold">{expiryMonth || 'MM'}/{expiryYear || 'YY'}</p>
						</div>
					</div>
				</div>

				<!-- Form Fields -->
				<div class="space-y-4">
					<div>
						<label for="checkout03-card-number" class="block text-sm font-medium mb-2">Card number</label>
						<input
							id="checkout03-card-number"
							type="text"
							value={cardNumber}
							onchange={handleCardInput}
							oninput={handleCardInput}
							placeholder="1234 5678 9012 3456"
							maxlength="19"
							class="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
						/>
					</div>

					<div>
						<label for="checkout03-cardholder-name" class="block text-sm font-medium mb-2">Cardholder name</label>
						<input
							id="checkout03-cardholder-name"
							type="text"
							bind:value={cardholderName}
							placeholder="Full name"
							class="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					<div class="grid grid-cols-3 gap-4">
						<div>
							<label for="checkout03-expiry-month" class="block text-sm font-medium mb-2">Month</label>
							<input
								id="checkout03-expiry-month"
								type="text"
								bind:value={expiryMonth}
								placeholder="MM"
								maxlength="2"
								class="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout03-expiry-year" class="block text-sm font-medium mb-2">Year</label>
							<input
								id="checkout03-expiry-year"
								type="text"
								bind:value={expiryYear}
								placeholder="YY"
								maxlength="2"
								class="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout03-cvv" class="block text-sm font-medium mb-2">CVV</label>
							<input
								id="checkout03-cvv"
								type="text"
								bind:value={cvv}
								placeholder="•••"
								maxlength="4"
								class="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
							/>
						</div>
					</div>

					<div class="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
						<div class="text-green-600">
							{@html LockIcon()}
						</div>
						<p class="text-sm text-green-700">Secured by SSL encryption</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Order Summary -->
		<div class="lg:col-span-1">
			<div class="rounded-lg border bg-background p-6 sticky top-6 space-y-6">
				<div>
					<h2 class="text-lg font-semibold mb-4">Order Summary</h2>

					<div class="space-y-3 mb-4 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Wireless Headphones x 1</span>
							<span>$129.99</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Phone Case x 1</span>
							<span>$24.99</span>
						</div>
					</div>

					<div class="border-t pt-4 space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Subtotal</span>
							<span>$154.98</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Shipping</span>
							<span>FREE</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Tax</span>
							<span>$15.01</span>
						</div>
					</div>

					<div class="border-t mt-4 pt-4 flex justify-between font-semibold text-base">
						<span>Total</span>
						<span>${totalAmount.toFixed(2)}</span>
					</div>
				</div>

				<Button class="w-full" size="lg">
					Pay ${totalAmount.toFixed(2)}
				</Button>

				<p class="text-xs text-muted-foreground text-center">
					Your payment information is safe and secure
				</p>
			</div>
		</div>
	</div>
</div>
