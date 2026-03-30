<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		onSubmit?: (data: any) => void;
	}

	let step: 1 | 2 = $state(1);
	let contactType = $state('');
	let name = $state('');
	let email = $state('');
	let message = $state('');

	const { class: className, onSubmit }: Props = $props();

	const contactOptions = [
		{ id: 'sales', label: 'Sales', description: 'Interested in our plans?' },
		{ id: 'support', label: 'Support', description: 'Need help with your account?' },
		{ id: 'general', label: 'General', description: 'Other inquiries' }
	];

	function handleSubmit() {
		if (onSubmit && name && email && message) {
			onSubmit({ type: contactType, name, email, message });
			name = '';
			email = '';
			message = '';
			step = 1;
			contactType = '';
		}
	}
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-lg">
		{#if step === 1}
			<div class="text-center">
				<h2 class="text-3xl font-bold">What can we help you with?</h2>
				<div class="mt-8 space-y-3">
					{#each contactOptions as option}
						<button
							onclick={() => {
								contactType = option.id;
								step = 2;
							}}
							class="flex flex-col items-start gap-2 w-full rounded-lg border p-4 text-left hover:border-foreground transition-colors"
						>
							<p class="font-semibold">{option.label}</p>
							<p class="text-sm text-muted-foreground">{option.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div>
				<Button variant="outline" onclick={() => (step = 1)} class="mb-8">← Back</Button>

				<h2 class="text-3xl font-bold">
					{contactOptions.find((opt) => opt.id === contactType)?.label} Inquiry
				</h2>

				<form class="mt-8 space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
					<input
						type="text"
						placeholder="Your name"
						bind:value={name}
						class="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
					/>
					<input
						type="email"
						placeholder="your@email.com"
						bind:value={email}
						class="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
					/>
					<textarea
						placeholder="Your message"
						bind:value={message}
						rows={5}
						class="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
					/>
					<Button type="submit" class="w-full">Send message</Button>
				</form>
			</div>
		{/if}
	</div>
</section>
