<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		placeholder?: string;
		ctaLabel?: string;
		onSubmit?: (email: string) => void;
	}

	let email = $state('');

	const {
		class: className,
		title = 'Get started today',
		description = 'Join thousands of users and start your journey with us.',
		placeholder = 'Enter your email',
		ctaLabel = 'Get started',
		onSubmit
	}: Props = $props();

	function handleSubmit() {
		if (onSubmit && email) {
			onSubmit(email);
			email = '';
		}
	}
</script>

<section class={cn('w-full bg-foreground text-background py-24 px-4 text-center', className)}>
	<div class="mx-auto max-w-lg">
		<h2 class="text-3xl font-bold">{title}</h2>
		<p class="mt-4 text-background/80">{description}</p>

		<div class="mt-8 flex gap-2">
			<input
				type="email"
				placeholder={placeholder}
				bind:value={email}
				class="flex-1 rounded-lg bg-background/10 px-4 py-2 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
				onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
			/>
			<Button onclick={handleSubmit} variant="secondary">{ctaLabel}</Button>
		</div>
	</div>
</section>
