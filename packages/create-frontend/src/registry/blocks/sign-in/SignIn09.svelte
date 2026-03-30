<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		onsubmit?: (data: { email: string; password: string }) => void;
		onforgot?: () => void;
		onsignup?: () => void;
	}

	let { onsubmit, onforgot, onsignup }: Props = $props();

	let email = $state('');
	let password = $state('');

	function handleSubmit() {
		if (onsubmit) {
			onsubmit({ email, password });
		}
	}
</script>

<div class="min-h-screen w-full bg-background flex items-center justify-center px-4">
	<div class="w-full max-w-xs">
		<!-- Logo -->
		<div class="flex justify-center mb-8">
			<div class="flex h-8 w-8 items-center justify-center rounded bg-foreground text-background">
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
		</div>

		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold text-foreground mb-2">Sign in</h1>
			<p class="text-sm text-muted-foreground">Access your account to continue</p>
		</div>

		<!-- Form -->
		<div class="space-y-4 mb-6">
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
			</div>

			<Button onclick={handleSubmit} class="w-full">Sign in</Button>
		</div>

		<!-- Forgot Password Link -->
		<div class="text-center mb-8">
			<button onclick={onforgot} class="text-sm text-primary hover:underline">
				Forgot password?
			</button>
		</div>

		<!-- Sign Up Link -->
		<div class="text-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<button onclick={onsignup} class="text-primary hover:underline font-medium"
					>Sign up</button
				>
			</p>
		</div>
	</div>
</div>
