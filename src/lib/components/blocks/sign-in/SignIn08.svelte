<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		oncontinue?: (data: { email: string }) => void;
		ongoogle?: () => void;
		ongithub?: () => void;
		onsignup?: () => void;
	}

	let { oncontinue, ongoogle, ongithub, onsignup }: Props = $props();

	let email = $state('');

	function handleContinue() {
		if (oncontinue) {
			oncontinue({ email });
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
			<h1 class="text-3xl font-bold text-foreground mb-2">Sign in</h1>
			<p class="text-sm text-muted-foreground">Welcome back! Please sign in to continue.</p>
		</div>

		<!-- Social Buttons -->
		<div class="space-y-3 mb-8">
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
				onclick={ongithub}
				variant="outline"
				class="w-full flex items-center justify-center gap-2"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
				</svg>
				GitHub
			</Button>
		</div>

		<!-- Divider -->
		<div class="relative my-8">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-muted"></div>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="px-2 bg-background text-muted-foreground">OR</span>
			</div>
		</div>

		<!-- Email Input -->
		<div class="space-y-4 mb-8">
			<input
				type="email"
				bind:value={email}
				placeholder="Placeholder"
				class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
			/>

			<Button onclick={handleContinue} class="w-full">Continue</Button>
		</div>

		<!-- Passkey Link -->
		<div class="text-center mb-8">
			<button class="text-sm text-primary hover:underline">Use passkey instead</button>
		</div>

		<!-- Sign Up Link -->
		<div class="text-center mb-8">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<button onclick={onsignup} class="text-primary hover:underline font-medium"
					>Sign up</button
				>
			</p>
		</div>

		<!-- Footer -->
		<div class="border-t border-muted pt-6 text-center">
			<p class="text-xs text-muted-foreground mb-4">© 2024 Shadcn UI Kit for Figma</p>
			<div class="flex justify-center gap-4 text-xs">
				<a href="#" class="text-muted-foreground hover:text-foreground">Terms</a>
				<a href="#" class="text-muted-foreground hover:text-foreground">Privacy</a>
			</div>
		</div>
	</div>
</div>
