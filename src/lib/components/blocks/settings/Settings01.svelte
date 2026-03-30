<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		onSaveCard?: () => void;
		onSaveClient?: () => void;
	}

	const { class: className, onSaveCard, onSaveClient }: Props = $props();

	// Card details state
	let nameOnCard = $state('Kathy Pacheco');
	let cardExpiry = $state('05/2025');
	let cardNumber = $state('•••• •••• •••• 4242');
	let cardCvv = $state('•••');

	// Client details state
	let clientName = $state('Kathy Pacheco');
	let clientEmail = $state('kathy@example.com');
	let clientCountry = $state('United States');
	let streetAddress = $state('2825 Winding Way');
	let city = $state('Providence');
	let state = $state('Rhode Island');

	function handleSaveCard() {
		onSaveCard?.();
	}

	function handleSaveClient() {
		onSaveClient?.();
	}

	// SVG Icons
	function GlobeIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 1 10 4M12 22a14.5 14.5 0 0 1-10-4M2 12h20M12 2a14.5 14.5 0 0 0 0 20M12 22a14.5 14.5 0 0 0 0-20"/></svg>`;
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Plan Banner -->
	<div class="rounded-lg bg-black px-6 py-4 text-white sm:px-8 sm:py-6">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-semibold">You're using free plan</h2>
				<p class="mt-1 text-sm text-gray-300">Upgrade your account to unlock more features and higher limits.</p>
			</div>
			<Button class="ml-4 flex-shrink-0">
				View plans →
			</Button>
		</div>
	</div>

	<!-- Card Details Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="mb-6">
			<h3 class="text-lg font-semibold">Card details</h3>
			<p class="mt-1 text-sm text-muted-foreground">Manage your payment method and billing information.</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label class="block text-sm font-medium mb-2">Name on card</label>
				<input
					type="text"
					bind:value={nameOnCard}
					placeholder="Full name"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Expiry</label>
				<input
					type="text"
					bind:value={cardExpiry}
					placeholder="MM/YYYY"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Card number</label>
				<input
					type="text"
					bind:value={cardNumber}
					placeholder="•••• •••• •••• ••••"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">CVV</label>
				<input
					type="text"
					bind:value={cardCvv}
					placeholder="•••"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
		</div>

		<div class="mt-6 flex justify-end">
			<Button onclick={handleSaveCard}>
				Save changes
			</Button>
		</div>
	</div>

	<!-- Client Details Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="mb-6">
			<h3 class="text-lg font-semibold">Client details</h3>
			<p class="mt-1 text-sm text-muted-foreground">Update your personal and billing address information.</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label class="block text-sm font-medium mb-2">Client name</label>
				<input
					type="text"
					bind:value={clientName}
					placeholder="Full name"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Email address</label>
				<input
					type="email"
					bind:value={clientEmail}
					placeholder="email@example.com"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Country</label>
				<div class="relative">
					<select
						bind:value={clientCountry}
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
					>
						<option>United States</option>
						<option>Canada</option>
						<option>United Kingdom</option>
						<option>Australia</option>
					</select>
					<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
						{@html GlobeIcon()}
					</div>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">Street address</label>
				<input
					type="text"
					bind:value={streetAddress}
					placeholder="Street address"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">City</label>
				<input
					type="text"
					bind:value={city}
					placeholder="City"
					class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium mb-2">State</label>
				<div class="relative">
					<select
						bind:value={state}
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
					>
						<option>Alabama</option>
						<option>Rhode Island</option>
						<option>California</option>
						<option>Texas</option>
					</select>
					<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
						{@html GlobeIcon()}
					</div>
				</div>
			</div>
		</div>

		<div class="mt-6 flex justify-end">
			<Button onclick={handleSaveClient}>
				Save changes
			</Button>
		</div>
	</div>
</div>
