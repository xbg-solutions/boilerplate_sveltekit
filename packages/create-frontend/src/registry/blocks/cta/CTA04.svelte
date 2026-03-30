<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	let {
		class: className = '',
		eyebrow = 'CTA Section',
		headline = 'Join thousands of users today',
		description = 'Start your free trial with no credit card required.',
		onSubmit = (email: string) => {}
	}: {
		class?: string;
		eyebrow?: string;
		headline?: string;
		description?: string;
		onSubmit?: (email: string) => void;
	} = $props();

	let email = $state('');

	function handleSubmit() {
		if (email.trim()) {
			onSubmit(email);
			email = '';
		}
	}
</script>

<section class={cn('w-full bg-background py-12 px-4', className)}>
	<div class="mx-auto max-w-5xl flex flex-col sm:flex-row gap-10 items-center">
		<!-- Left: Content & Form -->
		<div class="sm:w-1/2 flex flex-col">
			<p class="text-sm font-medium uppercase tracking-wide opacity-60 mb-2">{eyebrow}</p>
			<h2 class="text-2xl sm:text-3xl font-bold text-foreground mb-4">{headline}</h2>
			<p class="text-sm text-muted-foreground mb-6">{description}</p>

			<!-- Email Form -->
			<div class="flex gap-2">
				<input
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
				/>
				<Button size="sm" onclick={handleSubmit}>Start free</Button>
			</div>
		</div>

		<!-- Right: Image Placeholder -->
		<div class="sm:w-1/2">
			<div class="rounded-lg bg-muted flex items-center justify-center aspect-video w-full">
				<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" class="opacity-60">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="1" fill="none" />
				</svg>
			</div>
		</div>
	</div>
</section>
