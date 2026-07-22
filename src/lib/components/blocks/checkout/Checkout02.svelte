<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	let currentStep = $state(1);
	let email = $state('customer@example.com');
	let firstName = $state('John');
	let lastName = $state('Doe');

	const steps = [
		{ number: 1, title: 'Cart', label: 'Cart' },
		{ number: 2, title: 'Information', label: 'Information' },
		{ number: 3, title: 'Shipping', label: 'Shipping' },
		{ number: 4, title: 'Payment', label: 'Payment' }
	];

	function nextStep() {
		if (currentStep < steps.length) {
			currentStep += 1;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep -= 1;
		}
	}

	function ChevronRightIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
	}
</script>

<div class={cn('space-y-8', className)}>
	<div>
		<h1 class="text-3xl font-bold">Checkout</h1>
	</div>

	<!-- Step Indicators -->
	<div class="rounded-lg border bg-background p-6">
		<div class="flex items-center justify-between">
			{#each steps as step, idx}
				<div class="flex items-center flex-1">
					<div
						class={cn(
							'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition',
							currentStep >= step.number
								? 'bg-black text-white'
								: 'bg-gray-200 text-gray-600'
						)}
					>
						{step.number}
					</div>
					<p class="ml-3 text-sm font-medium">{step.title}</p>
					{#if idx < steps.length - 1}
						<div class="flex-1 h-0.5 mx-4 transition"
							class:bg-black={currentStep > step.number}
							class:bg-gray-200={currentStep <= step.number}
						></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Step Content -->
	<div class="rounded-lg border bg-background p-8 min-h-[400px]">
		{#if currentStep === 1}
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Your Cart</h2>
				<div class="space-y-3 mt-6">
					<div class="flex justify-between p-4 border rounded-lg">
						<span>Wireless Headphones x 1</span>
						<span class="font-semibold">$129.99</span>
					</div>
					<div class="flex justify-between p-4 border rounded-lg">
						<span>Phone Case x 1</span>
						<span class="font-semibold">$24.99</span>
					</div>
				</div>
				<div class="border-t pt-4 mt-6">
					<div class="flex justify-between font-semibold text-lg">
						<span>Total</span>
						<span>$154.99</span>
					</div>
				</div>
			</div>
		{:else if currentStep === 2}
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Contact Information</h2>
				<div class="mt-6 space-y-4">
					<div>
						<label for="checkout-email" class="block text-sm font-medium mb-2">Email address</label>
						<input
							type="email"
							id="checkout-email"
							bind:value={email}
							placeholder="email@example.com"
							class="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4 max-w-md">
						<div>
							<label for="checkout-first-name" class="block text-sm font-medium mb-2">First name</label>
							<input
								type="text"
								id="checkout-first-name"
								bind:value={firstName}
								placeholder="John"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout-last-name" class="block text-sm font-medium mb-2">Last name</label>
							<input
								type="text"
								id="checkout-last-name"
								bind:value={lastName}
								placeholder="Doe"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
					</div>
				</div>
			</div>
		{:else if currentStep === 3}
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Shipping Method</h2>
				<div class="mt-6 space-y-3 max-w-md">
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
						<input type="radio" name="shipping" class="w-4 h-4" defaultChecked />
						<div class="flex-1">
							<p class="font-medium">Standard Shipping</p>
							<p class="text-sm text-muted-foreground">5-7 business days</p>
						</div>
						<span class="font-semibold">$9.99</span>
					</label>
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
						<input type="radio" name="shipping" class="w-4 h-4" />
						<div class="flex-1">
							<p class="font-medium">Express Shipping</p>
							<p class="text-sm text-muted-foreground">1-2 business days</p>
						</div>
						<span class="font-semibold">$24.99</span>
					</label>
				</div>
			</div>
		{:else if currentStep === 4}
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Payment</h2>
				<div class="mt-6 space-y-4 max-w-md">
					<div>
						<label for="checkout-card-number" class="block text-sm font-medium mb-2">Card number</label>
						<input
							type="text"
							id="checkout-card-number"
							placeholder="•••• •••• •••• ••••"
							class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="checkout-expiry" class="block text-sm font-medium mb-2">Expiry</label>
							<input
								type="text"
								id="checkout-expiry"
								placeholder="MM/YY"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
						<div>
							<label for="checkout-cvv" class="block text-sm font-medium mb-2">CVV</label>
							<input
								type="text"
								id="checkout-cvv"
								placeholder="•••"
								class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation -->
	<div class="flex gap-4 justify-between">
		<Button
			variant="outline"
			onclick={prevStep}
			disabled={currentStep === 1}
		>
			Back
		</Button>
		<Button
			onclick={nextStep}
			disabled={currentStep === steps.length}
		>
			{currentStep === steps.length ? 'Complete' : 'Continue'}
			{#if currentStep < steps.length}
				<span class="ml-2">{@html ChevronRightIcon()}</span>
			{/if}
		</Button>
	</div>
</div>
