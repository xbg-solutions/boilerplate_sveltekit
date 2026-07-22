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
		description = 'Have a question? We would love to hear from you.',
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
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 gap-12 sm:grid-cols-2">
			<div>
				<h2 class="text-3xl font-bold">{title}</h2>
				<p class="mt-4 text-muted-foreground">{description}</p>

				<div class="mt-12 space-y-6">
					<div class="flex gap-4">
						<div class="h-6 w-6 text-muted-foreground flex-shrink-0">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path
									d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
								/>
								<polyline points="22,6 12,13 2,6" />
							</svg>
						</div>
						<div>
							<p class="font-semibold">Email</p>
							<p class="text-muted-foreground">hello@example.com</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="h-6 w-6 text-muted-foreground flex-shrink-0">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path
									d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10.5 19.79 19.79 0 0 1 1.56 2.18 2 2 0 0 1 3.53 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
								/>
							</svg>
						</div>
						<div>
							<p class="font-semibold">Phone</p>
							<p class="text-muted-foreground">+1 (555) 000-0000</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="h-6 w-6 text-muted-foreground flex-shrink-0">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
						</div>
						<div>
							<p class="font-semibold">Address</p>
							<p class="text-muted-foreground">123 Main St, City, State 12345</p>
						</div>
					</div>
				</div>
			</div>

			<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
</section>
