<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		defaultTab?: 'login' | 'signup';
		onsignin?: (data: { email: string; password: string; remember: boolean }) => void;
		onsignup?: (data: { name: string; email: string; password: string }) => void;
		ongoogle?: () => void;
		onapple?: () => void;
	}

	let { defaultTab = 'login', onsignin, onsignup, ongoogle, onapple }: Props = $props();

	// svelte-ignore state_referenced_locally
	let activeTab = $state(defaultTab);
	let loginEmail = $state('');
	let loginPassword = $state('');
	let loginRemember = $state(false);
	let signupName = $state('');
	let signupEmail = $state('');
	let signupPassword = $state('');

	function handleSignIn() {
		if (onsignin) {
			onsignin({ email: loginEmail, password: loginPassword, remember: loginRemember });
		}
	}

	function handleSignUp() {
		if (onsignup) {
			onsignup({ name: signupName, email: signupEmail, password: signupPassword });
		}
	}
</script>

<div class="min-h-screen w-full bg-background flex items-center justify-center px-4">
	<div class="w-full max-w-sm">
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
			<h1 class="text-3xl font-bold text-foreground mb-2">Get started</h1>
			<p class="text-sm text-muted-foreground">
				Create an account or log in to your existing account
			</p>
		</div>

		<!-- Tab Switcher -->
		<div class="flex gap-2 mb-8 bg-muted p-1 rounded-lg">
			<button
				onclick={() => (activeTab = 'login')}
				class={cn(
					'flex-1 py-2 px-4 rounded-md transition-colors text-sm font-medium',
					activeTab === 'login'
						? 'bg-background text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Log in
			</button>
			<button
				onclick={() => (activeTab = 'signup')}
				class={cn(
					'flex-1 py-2 px-4 rounded-md transition-colors text-sm font-medium',
					activeTab === 'signup'
						? 'bg-background text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Create Account
			</button>
		</div>

		<!-- Login Tab -->
		{#if activeTab === 'login'}
			<div class="space-y-4">
				<div>
					<label for="signin-login-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
					<input
						type="email"
						id="signin-login-email"
						bind:value={loginEmail}
						placeholder="you@example.com"
						class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
					/>
				</div>

				<div>
					<label for="signin-login-password" class="block text-sm font-medium text-foreground mb-2">Password</label>
					<input
						type="password"
						id="signin-login-password"
						bind:value={loginPassword}
						placeholder="••••••••"
						class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
					/>
				</div>

				<div class="flex items-center justify-between">
					<label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
						<input type="checkbox" bind:checked={loginRemember} class="rounded" />
						<span>Keep me signed in</span>
					</label>
					<a href="#" class="text-sm text-primary hover:underline">Forgot your password?</a>
				</div>

				<Button onclick={handleSignIn} class="w-full">Log in</Button>

				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-muted"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-background text-muted-foreground">OR</span>
					</div>
				</div>

				<Button
					onclick={ongoogle}
					variant="outline"
					class="w-full flex items-center justify-center gap-2"
				>
					<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
						<path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
						<path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
						<path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
						<path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
					</svg>
					Google
				</Button>

				<Button
					onclick={onapple}
					variant="outline"
					class="w-full flex items-center justify-center gap-2"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
					</svg>
					Apple
				</Button>
			</div>
		{/if}

		<!-- Signup Tab -->
		{#if activeTab === 'signup'}
			<div class="space-y-4">
				<div>
					<label for="signin-signup-name" class="block text-sm font-medium text-foreground mb-2">Name</label>
					<input
						type="text"
						id="signin-signup-name"
						bind:value={signupName}
						placeholder="John Doe"
						class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
					/>
				</div>

				<div>
					<label for="signin-signup-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
					<input
						type="email"
						id="signin-signup-email"
						bind:value={signupEmail}
						placeholder="you@example.com"
						class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
					/>
				</div>

				<div>
					<label for="signin-signup-password" class="block text-sm font-medium text-foreground mb-2">Password</label>
					<input
						type="password"
						id="signin-signup-password"
						bind:value={signupPassword}
						placeholder="••••••••"
						class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
					/>
				</div>

				<Button onclick={handleSignUp} class="w-full">Create account</Button>

				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-muted"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-background text-muted-foreground">OR</span>
					</div>
				</div>

				<Button
					onclick={ongoogle}
					variant="outline"
					class="w-full flex items-center justify-center gap-2"
				>
					<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
						<path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
						<path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
						<path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
						<path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
					</svg>
					Google
				</Button>

				<Button
					onclick={onapple}
					variant="outline"
					class="w-full flex items-center justify-center gap-2"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
					</svg>
					Apple
				</Button>
			</div>
		{/if}
	</div>
</div>
