<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		heading?: string;
	}

	let { class: className, heading = 'Join Our Loyalty Program' }: Props = $props();

	let email = $state('');
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
			<!-- Left Section -->
			<div class="bg-gray-950 text-white rounded-xl p-8 sm:p-12">
				<h2 class="text-3xl sm:text-4xl font-bold mb-6">{heading}</h2>

				<!-- Benefits List -->
				<ul class="space-y-4">
					<li class="flex items-start gap-3">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="text-green-400 mt-1 flex-shrink-0"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Free shipping on all orders</span>
					</li>
					<li class="flex items-start gap-3">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="text-green-400 mt-1 flex-shrink-0"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Exclusive members-only deals</span>
					</li>
					<li class="flex items-start gap-3">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="text-green-400 mt-1 flex-shrink-0"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Earn points on every purchase</span>
					</li>
					<li class="flex items-start gap-3">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="text-green-400 mt-1 flex-shrink-0"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Priority customer support</span>
					</li>
				</ul>
			</div>

			<!-- Right Section -->
			<div class="flex flex-col">
				<h3 class="text-2xl font-semibold mb-4">Sign Up Today</h3>
				<p class="text-muted-foreground mb-6">Get exclusive offers and discounts delivered to your inbox</p>

				<!-- Form -->
				<form class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-semibold mb-2">Email Address</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="your@email.com"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>

					<Button class="w-full" disabled={!email}>Sign Up</Button>

					<p class="text-xs text-muted-foreground">
						We respect your privacy. Unsubscribe at any time.
					</p>
				</form>
			</div>
		</div>
	</div>
</section>
