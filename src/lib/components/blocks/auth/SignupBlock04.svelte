<!--
  SignupBlock04.svelte
  Split layout signup form with image on the left and form on the right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
    Input,
    Label
  } from '$lib/components/ui';
  import { BrandIcon } from '$lib/components/ui/icon';

  let className: string = '';
  export { className as class };

  export let onSubmit: ((data: { name: string; email: string; password: string; confirmPassword: string }) => void) | undefined = undefined;
  export let onGoogleSignup: (() => void) | undefined = undefined;
  export let onSignIn: (() => void) | undefined = undefined;
  export let imageSrc: string = '';
  export let imageAlt: string = 'Sign up illustration';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';

  function handleSubmit() {
    onSubmit?.({ name, email, password, confirmPassword });
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <div class="grid w-full max-w-4xl overflow-hidden rounded-lg border bg-card shadow-sm md:grid-cols-2">
    <div class="hidden bg-muted md:block">
      {#if imageSrc}
        <img src={imageSrc} alt={imageAlt} class="h-full w-full object-cover" />
      {:else}
        <div class="flex h-full items-center justify-center bg-muted">
          <p class="text-muted-foreground">Image placeholder</p>
        </div>
      {/if}
    </div>
    <div class="flex flex-col justify-center p-6 md:p-8">
      <div class="space-y-1.5 pb-4">
        <h2 class="text-2xl font-semibold leading-none tracking-tight">Create an account</h2>
        <p class="text-sm text-muted-foreground">Enter your information below to create your account</p>
      </div>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="signup04-name">Full name</Label>
          <Input
            type="text"
            placeholder="John Doe"
            bind:value={name}
          />
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup04-email">Email</Label>
          <Input
            type="email"
            placeholder="m@example.com"
            bind:value={email}
          />
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup04-password">Password</Label>
          <Input
            type="password"
            bind:value={password}
          />
          <p class="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup04-confirm-password">Confirm Password</Label>
          <Input
            type="password"
            bind:value={confirmPassword}
          />
        </div>
        <Button type="submit" class="w-full">Create Account</Button>
        <Button variant="outline" type="button" class="w-full" on:click={onGoogleSignup}>
          <BrandIcon name="google" size={16} colored class="mr-2" />
          Sign up with Google
        </Button>
      </form>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?
        <button
          type="button"
          class="text-primary underline-offset-4 hover:underline"
          on:click={onSignIn}
        >
          Sign in
        </button>
      </p>
    </div>
  </div>
</div>
