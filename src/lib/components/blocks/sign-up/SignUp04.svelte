<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		onsubmit?: (data: { name: string; email: string; password: string }) => void;
		onsignin?: () => void;
		ongoogle?: () => void;
		ongithub?: () => void;
		onapple?: () => void;
	}

	let { onsubmit, onsignin, ongoogle, ongithub, onapple }: Props = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');

	function handleSubmit() {
		if (onsubmit) {
			onsubmit({ name, email, password });
		}
	}
</script>

<div class="min-h-screen w-full bg-muted flex items-center justify-center px-4">
	<div class="w-full max-w-sm bg-background rounded-lg border p-8 shadow-md">
		<!-- Header -->
		<h1 class="text-3xl font-bold text-foreground mb-2">Create an account</h1>
		<p class="text-sm text-muted-foreground mb-8">
			Sign up to get started with our platform
		</p>

		<!-- Form -->
		<div class="space-y-4 mb-6">
			<div>
				<label for="signup04-name" class="block text-sm font-medium text-foreground mb-2">Name</label>
				<input
					id="signup04-name"
					type="text"
					bind:value={name}
					placeholder="John Doe"
					class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
				/>
			</div>

			<div>
				<label for="signup04-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
				<input
					id="signup04-email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
				/>
			</div>

			<div>
				<label for="signup04-password" class="block text-sm font-medium text-foreground mb-2">Password</label>
				<input
					id="signup04-password"
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

		<!-- Divider -->
		<div class="relative my-6">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-muted"></div>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="px-2 bg-background text-muted-foreground">OR SIGN IN WITH</span>
			</div>
		</div>

		<!-- Social Icons -->
		<div class="flex gap-3 justify-center mb-6">
			<button
				onclick={ongithub}
				class="flex items-center justify-center w-10 h-10 rounded-md border hover:bg-muted transition-colors"
				aria-label="Sign in with GitHub"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
				</svg>
			</button>
			<button
				onclick={ongoogle}
				class="flex items-center justify-center w-10 h-10 rounded-md border hover:bg-muted transition-colors"
				aria-label="Sign in with Google"
			>
				<svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
					<path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
					<path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
					<path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
					<path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
				</svg>
			</button>
			<button
				onclick={onapple}
				class="flex items-center justify-center w-10 h-10 rounded-md border hover:bg-muted transition-colors"
				aria-label="Sign in with Apple"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
				</svg>
			</button>
		</div>

		<!-- Sign In Link -->
		<p class="text-center text-sm text-muted-foreground">
			Already have an account?
			<button onclick={onsignin} class="text-primary hover:underline font-medium"
				>Sign in</button
			>
		</p>
	</div>
</div>
