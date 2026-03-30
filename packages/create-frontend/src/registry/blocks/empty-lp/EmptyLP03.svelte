<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		onNotify?: (email: string) => void;
	}

	let email = $state('');

	const {
		class: className,
		title = 'Something amazing is coming',
		description = 'Be the first to know when we launch.',
		onNotify
	}: Props = $props();

	function handleNotify() {
		if (onNotify && email) {
			onNotify(email);
			email = '';
		}
	}
</script>

<section class={cn('w-full bg-background py-24 px-4 text-center', className)}>
	<div class="mx-auto max-w-lg">
		<p class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Coming soon</p>
		<h2 class="mt-4 text-4xl font-bold">{title}</h2>
		<p class="mt-4 text-muted-foreground">{description}</p>

		<div class="mt-12 flex justify-center gap-8">
			<div class="flex flex-col items-center">
				<p class="text-4xl font-bold">12</p>
				<p class="text-sm text-muted-foreground mt-2">Days</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-4xl font-bold">04</p>
				<p class="text-sm text-muted-foreground mt-2">Hours</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="text-4xl font-bold">32</p>
				<p class="text-sm text-muted-foreground mt-2">Minutes</p>
			</div>
		</div>

		<div class="mt-12 flex gap-2">
			<input
				type="email"
				placeholder="Enter your email"
				bind:value={email}
				class="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
				onkeydown={(e) => e.key === 'Enter' && handleNotify()}
			/>
			<Button onclick={handleNotify}>Notify me</Button>
		</div>
	</div>
</section>
