<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		onsubmit?: (data: { name: string; email: string; password: string }) => void;
		onsignin?: () => void;
	}

	let { onsubmit, onsignin }: Props = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');

	function handleSubmit() {
		if (onsubmit) {
			onsubmit({ name, email, password });
		}
	}
</script>

<div class="min-h-screen w-full bg-background flex items-center justify-center px-4">
	<div class="w-full max-w-xs text-center">
		<!-- Logo -->
		<div class="flex h-8 w-8 items-center justify-center rounded bg-foreground text-background mx-auto mb-8">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path
					d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
				/>
			</svg>
		</div>

		<!-- Header -->
		<h1 class="text-3xl font-bold text-foreground mb-2">Create an account</h1>
		<p class="text-sm text-muted-foreground mb-8">
			Sign up to get started with our platform
		</p>

		<!-- Form -->
		<div class="space-y-4 mb-6 text-left">
			<div>
				<label class="block text-sm font-medium text-foreground mb-2">Name</label>
				<input
					type="text"
					bind:value={name}
					placeholder="John Doe"
					class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-foreground mb-2">Email</label>
				<input
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-foreground mb-2">Password</label>
				<input
					type="password"
					bind:value={password}
					placeholder="••••••••"
					class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
				/>
				<p class="text-xs text-muted-foreground mt-2">Minimum 8 characters.</p>
			</div>

			<label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
				<input type="checkbox" class="rounded" />
				<span>I agree to the Terms & Conditions</span>
			</label>

			<Button onclick={handleSubmit} class="w-full">Sign up</Button>
		</div>

		<!-- Sign In Link -->
		<p class="text-sm text-muted-foreground">
			Already have an account?
			<button onclick={onsignin} class="text-primary hover:underline font-medium"
				>Sign in</button
			>
		</p>
	</div>
</div>
