<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	const orderNumber = 'ORD-2024-001234';
	const status = 'In Transit';
	const estimatedDelivery = 'April 5, 2026';
	const trackingNumber = 'FDX7845629123456';
	const carrier = 'FedEx';

	interface TrackingStep {
		title: string;
		date: string;
		completed: boolean;
		location: string;
	}

	let trackingSteps = $state<TrackingStep[]>([
		{ title: 'Order Placed', date: 'March 28, 2026', completed: true, location: 'New York, NY' },
		{ title: 'Processing', date: 'March 29, 2026', completed: true, location: 'Warehouse' },
		{ title: 'Shipped', date: 'March 30, 2026', completed: true, location: 'Distribution Center' },
		{ title: 'Out for Delivery', date: 'April 4, 2026', completed: true, location: 'Local facility' },
		{ title: 'Delivered', date: 'April 5, 2026', completed: false, location: 'Your address' }
	]);

	function CheckIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
	}

	function TruckIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 18h22"/><path d="M3 6h12v11H3z"/><path d="M15 6h6l3 3v8h-9z"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`;
	}
</script>

<div class={cn('space-y-8', className)}>
	<!-- Header -->
	<div class="space-y-2">
		<h1 class="text-3xl font-bold">Track Order</h1>
		<p class="text-muted-foreground">Order {orderNumber}</p>
	</div>

	<!-- Status Card -->
	<div class="rounded-lg border bg-background p-8 space-y-6">
		<div class="flex items-start justify-between">
			<div>
				<p class="text-muted-foreground text-sm mb-1">Current status</p>
				<h2 class="text-2xl font-semibold">{status}</h2>
				<p class="text-muted-foreground mt-2">Estimated delivery: {estimatedDelivery}</p>
			</div>
			<div class="text-blue-600">
				{@html TruckIcon()}
			</div>
		</div>

		<!-- Carrier & Tracking -->
		<div class="border-t pt-6 grid grid-cols-2 gap-8">
			<div>
				<p class="text-sm text-muted-foreground mb-1">Carrier</p>
				<p class="font-semibold">{carrier}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground mb-1">Tracking number</p>
				<p class="font-mono font-semibold text-sm break-all">{trackingNumber}</p>
			</div>
		</div>
	</div>

	<!-- Tracking Timeline -->
	<div class="rounded-lg border bg-background p-8">
		<h2 class="text-lg font-semibold mb-6">Tracking history</h2>

		<div class="space-y-6">
			{#each trackingSteps as step, idx}
				<div class="flex gap-4">
					<!-- Timeline Marker -->
					<div class="flex flex-col items-center">
						<div
							class={cn(
								'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
								step.completed
									? 'bg-green-100 text-green-600'
									: idx === 4
										? 'bg-blue-100 text-blue-600'
										: 'bg-gray-100 text-gray-400'
							)}
						>
							{#if step.completed}
								<span class="text-green-600">{@html CheckIcon()}</span>
							{:else}
								<span class="text-lg">•</span>
							{/if}
						</div>

						<!-- Connecting Line -->
						{#if idx < trackingSteps.length - 1}
							<div
								class={cn(
									'w-0.5 h-24 my-2',
									step.completed ? 'bg-green-200' : 'bg-gray-200'
								)}
							></div>
						{/if}
					</div>

					<!-- Content -->
					<div class="flex-1 pt-1">
						<p class="font-semibold">{step.title}</p>
						<p class="text-sm text-muted-foreground">{step.location}</p>
						<p class="text-xs text-muted-foreground mt-1">{step.date}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Additional Info -->
	<div class="rounded-lg bg-blue-50 border border-blue-200 p-6">
		<p class="text-sm text-blue-900">
			<span class="font-semibold">Note:</span> Tracking information is updated periodically. Refresh this page for the latest updates.
		</p>
	</div>

	<!-- Action Button -->
	<Button variant="outline" class="w-full">
		View full order details
	</Button>
</div>
