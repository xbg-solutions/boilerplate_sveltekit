<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		onSubmit?: (data: any) => void;
	}

	let name = $state('');
	let email = $state('');
	let message = $state('');

	const {
		class: className,
		title = 'Get in touch',
		description = 'We would love to hear from you. Send us a message and we will respond as soon as possible.',
		onSubmit
	}: Props = $props();

	function handleSubmit() {
		if (onSubmit && name && email && message) {
			onSubmit({ name, email, message });
			name = '';
			email = '';
			message = '';
		}
	}
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-lg text-center">
		<h2 class="text-3xl font-bold">{title}</h2>
		<p class="mt-4 text-muted-foreground">{description}</p>

		<form class="mt-8 space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<input
					type="text"
					placeholder="Your name"
					bind:value={name}
					class="rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<input
					type="email"
					placeholder="your@email.com"
					bind:value={email}
					class="rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<textarea
				placeholder="Your message"
				bind:value={message}
				rows={5}
				class="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
			/>

			<Button type="submit" class="w-full">Send message</Button>
		</form>
	</div>
</section>
