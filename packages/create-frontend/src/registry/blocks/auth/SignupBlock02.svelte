<!--
  SignupBlock02.svelte
  Create account form without confirm password field.
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

  let {
    class: className = '',
    onSubmit = undefined,
    onGoogleSignup = undefined,
    onSignIn = undefined
  }: {
    class?: string;
    onSubmit?: ((data: { name: string; email: string; password: string }) => void) | undefined;
    onGoogleSignup?: (() => void) | undefined;
    onSignIn?: (() => void) | undefined;
  } = $props();

  let name = $state('');
  let email = $state('');
  let password = $state('');

  function handleSubmit() {
    onSubmit?.({ name, email, password });
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-2xl">Create an account</CardTitle>
      <CardDescription>Enter your information below to create your account</CardDescription>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="signup02-name">Full name</Label>
          <Input
            type="text"
            placeholder="John Doe"
            bind:value={name}
          />
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup02-email">Email</Label>
          <Input
            type="email"
            placeholder="m@example.com"
            bind:value={email}
          />
          <p class="text-xs text-muted-foreground">We'll use this to contact you.</p>
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup02-password">Password</Label>
          <Input
            type="password"
            bind:value={password}
          />
          <p class="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
        </div>
        <Button type="submit" class="w-full">Create Account</Button>
        <Button variant="outline" type="button" class="w-full" onclick={onGoogleSignup}>
          <BrandIcon name="google" size={16} colored class="mr-2" />
          Sign up with Google
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center">
      <p class="text-sm text-muted-foreground">
        Already have an account?
        <button
          type="button"
          class="text-primary underline-offset-4 hover:underline"
          onclick={onSignIn}
        >
          Sign in
        </button>
      </p>
    </CardFooter>
  </Card>
</div>
