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

<section class={cn('w-full bg-foreground text-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-lg text-center">
		<h2 class="text-3xl font-bold">{title}</h2>
		<p class="mt-4 text-background/80">{description}</p>

		<form class="mt-8 space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<input
					type="text"
					placeholder="Your name"
					bind:value={name}
					class="rounded-lg bg-background/10 border border-background/20 px-4 py-2 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
				/>
				<input
					type="email"
					placeholder="your@email.com"
					bind:value={email}
					class="rounded-lg bg-background/10 border border-background/20 px-4 py-2 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
				/>
			</div>

			<textarea
				placeholder="Your message"
				bind:value={message}
				rows={5}
				class="w-full rounded-lg bg-background/10 border border-background/20 px-4 py-2 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
			></textarea>

			<Button type="submit" variant="secondary" class="w-full">Send message</Button>
		</form>
	</div>
</section>
