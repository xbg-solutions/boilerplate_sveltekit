<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		description?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
	}

	let {
		class: className,
		eyebrow = 'New release ✦',
		title = 'The modern way to build for the web',
		description,
		primaryLabel = 'Sign up',
		secondaryLabel = 'View demo',
		onPrimary,
		onSecondary
	}: Props = $props();

	let formData = $state({
		name: '',
		email: '',
		password: ''
	});
</script>

<section class={cn('w-full bg-background px-4 py-20 sm:py-28', className)}>
	<div class="mx-auto max-w-4xl">
		<div class="grid grid-cols-1 gap-12 sm:grid-cols-2 items-center">
			<div>
				{#if eyebrow}
					<div class="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs">
						{eyebrow}
					</div>
				{/if}

				{#if title}
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h1>
				{/if}

				{#if description}
					<p class="text-lg text-muted-foreground">{description}</p>
				{/if}
			</div>

			<div class="rounded-xl border bg-background p-6 shadow-lg">
				<h2 class="text-2xl font-bold mb-6">Create your account</h2>

				<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); onPrimary?.(); }}>
					<div>
						<label for="name" class="block text-sm font-medium mb-2">Full Name</label>
						<input
							id="name"
							type="text"
							bind:value={formData.name}
							placeholder="John Doe"
							class="w-full px-4 py-2 rounded-lg border bg-background border-muted focus:outline-none focus:ring-2 focus:ring-foreground"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium mb-2">Email</label>
						<input
							id="email"
							type="email"
							bind:value={formData.email}
							placeholder="you@example.com"
							class="w-full px-4 py-2 rounded-lg border bg-background border-muted focus:outline-none focus:ring-2 focus:ring-foreground"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium mb-2">Password</label>
						<input
							id="password"
							type="password"
							bind:value={formData.password}
							placeholder="••••••••"
							class="w-full px-4 py-2 rounded-lg border bg-background border-muted focus:outline-none focus:ring-2 focus:ring-foreground"
						/>
					</div>

					<Button type="submit" class="w-full">
						{primaryLabel}
					</Button>
				</form>
			</div>
		</div>
	</div>
</section>
