<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		onsubmit?: (data: { email: string; password: string; remember: boolean }) => void;
		onforgot?: () => void;
		onsignup?: () => void;
	}

	let { onsubmit, onforgot, onsignup }: Props = $props();

	let email = $state('');
	let password = $state('');
	let remember = $state(false);

	function handleSubmit() {
		if (onsubmit) {
			onsubmit({ email, password, remember });
		}
	}
</script>

<div class="min-h-screen w-full bg-muted flex items-center justify-center px-4">
	<div class="w-full max-w-xs bg-background rounded-xl shadow-md p-8 border">
		<!-- Header -->
		<h2 class="text-2xl font-bold text-foreground mb-6">Sign in</h2>

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

			<label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
				<input type="checkbox" bind:checked={remember} class="rounded" />
				<span>Remember me</span>
			</label>

			<Button onclick={handleSubmit} class="w-full">Sign in</Button>
		</div>

		<!-- Divider -->
		<div class="border-t border-muted my-6"></div>

		<!-- Forgot Password Link -->
		<div class="text-center mb-6">
			<button onclick={onforgot} class="text-sm text-primary hover:underline">
				Forgot password?
			</button>
		</div>

		<!-- Sign Up Section -->
		<div class="space-y-3">
			<p class="text-sm text-muted-foreground">Don't have an account?</p>
			<Button onclick={onsignup} variant="outline" class="w-full">Sign up</Button>
		</div>
	</div>
</div>
