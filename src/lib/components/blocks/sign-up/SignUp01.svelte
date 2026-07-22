<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		onsubmit?: (data: { name: string; email: string; password: string; terms: boolean }) => void;
		onsignin?: () => void;
	}

	let { onsubmit, onsignin }: Props = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let terms = $state(false);

	function handleSubmit() {
		if (onsubmit) {
			onsubmit({ name, email, password, terms });
		}
	}
</script>

<div class="min-h-screen w-full bg-background">
	<div class="flex flex-col lg:flex-row">
		<!-- Form Column -->
		<div class="flex-1 flex items-center justify-center px-4 py-12 lg:py-0">
			<div class="w-full max-w-sm">
				<!-- Logo -->
				<div class="flex h-8 w-8 items-center justify-center rounded bg-foreground text-background mb-8">
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
					Let's get started. Fill in the details below to create your account.
				</p>

				<!-- Form -->
				<div class="space-y-4 mb-6">
					<div>
						<label for="sign-up-name" class="block text-sm font-medium text-foreground mb-2">Name</label>
						<input
							id="sign-up-name"
							type="text"
							bind:value={name}
							placeholder="John Doe"
							class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
						/>
					</div>

					<div>
						<label for="sign-up-email" class="block text-sm font-medium text-foreground mb-2">Email</label>
						<input
							id="sign-up-email"
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
						/>
					</div>

					<div>
						<label for="sign-up-password" class="block text-sm font-medium text-foreground mb-2">Password</label>
						<input
							id="sign-up-password"
							type="password"
							bind:value={password}
							placeholder="••••••••"
							class="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-full"
						/>
						<p class="text-xs text-muted-foreground mt-2">Minimum 8 characters.</p>
					</div>

					<label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
						<input type="checkbox" bind:checked={terms} class="rounded" />
						<span>I agree to the Terms & Conditions</span>
					</label>

					<Button onclick={handleSubmit} class="w-full">Sign up</Button>
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

		<!-- Image Column -->
		<div class="hidden lg:flex flex-1 items-center justify-center bg-muted px-4 py-12">
			<div class="w-full max-w-sm aspect-square bg-muted-foreground/10 rounded-lg flex items-center justify-center">
				<svg
					width="64"
					height="64"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-muted-foreground/50"
				>
					<rect width="18" height="18" x="3" y="3" rx="2"/>
					<path d="M9 9h6v6H9z"/>
				</svg>
			</div>
		</div>
	</div>
</div>
