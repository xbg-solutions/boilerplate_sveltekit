<!--
  SignupBlock05.svelte
  Minimal signup form with just email and password.
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

  let {
    class: className = '',
    onSubmit = undefined,
    onSignIn = undefined
  }: {
    class?: string;
    onSubmit?: ((data: { email: string; password: string }) => void) | undefined;
    onSignIn?: (() => void) | undefined;
  } = $props();

  let email = $state('');
  let password = $state('');

  function handleSubmit() {
    onSubmit?.({ email, password });
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-2xl">Create an account</CardTitle>
      <CardDescription>Enter your email and password to get started</CardDescription>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="signup05-email">Email</Label>
          <Input
            type="email"
            placeholder="m@example.com"
            bind:value={email}
          />
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup05-password">Password</Label>
          <Input
            type="password"
            bind:value={password}
          />
          <p class="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
        </div>
        <Button type="submit" class="w-full">Create Account</Button>
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
