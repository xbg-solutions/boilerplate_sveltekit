<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		onSubmit?: (data: any) => void;
	}

	let name = $state('');
	let email = $state('');
	let message = $state('');

	const {
		class: className,
		title = 'Get in touch',
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

<section class={cn('w-full bg-background', className)}>
	<div class="grid grid-cols-1 gap-0 sm:grid-cols-2">
		<div class="py-16 px-4 sm:px-6">
			<div class="mx-auto max-w-lg">
				<h2 class="text-3xl font-bold">{title}</h2>

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
					></textarea>
					<Button type="submit" class="w-full">Send message</Button>
				</form>
			</div>
		</div>

		<div class="bg-muted rounded-r-xl flex items-center justify-center min-h-[300px] hidden sm:flex">
			<div class="text-muted-foreground flex flex-col items-center gap-2">
				<svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
					<circle cx="12" cy="10" r="3" />
				</svg>
				<p class="text-sm">Our location</p>
			</div>
		</div>
	</div>
</section>
