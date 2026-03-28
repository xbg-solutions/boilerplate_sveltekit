<!--
  LoginBlock05.svelte
  Login form with divider and inline footer text.
-->
<script lang="ts">
  import { cn } from '@xbg.solutions/frontend-core';
  import {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    Input,
    Label,
    Separator
  } from '$lib/components/ui';
  import { BrandIcon } from '$lib/components/ui/icon';

  let {
    class: className = '',
    onSubmit = undefined,
    onGoogleLogin = undefined,
    onForgotPassword = undefined,
    onSignUp = undefined
  }: {
    class?: string;
    onSubmit?: ((email: string, password: string) => void) | undefined;
    onGoogleLogin?: (() => void) | undefined;
    onForgotPassword?: (() => void) | undefined;
    onSignUp?: (() => void) | undefined;
  } = $props();

  let email = $state('');
  let password = $state('');

  function handleSubmit() {
    onSubmit?.(email, password);
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-2xl">Login to your account</CardTitle>
      <CardDescription>Enter your email below to login to your account</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="login05-email">Email</Label>
          <Input
            type="email"
            placeholder="m@example.com"
            bind:value={email}
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label htmlFor="login05-password">Password</Label>
            <button
              type="button"
              class="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onclick={onForgotPassword}
            >
              Forgot your password?
            </button>
          </div>
          <Input
            type="password"
            bind:value={password}
          />
        </div>
        <Button type="submit" class="w-full">Login</Button>
      </form>

      <div class="relative">
        <Separator />
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase text-muted-foreground">
          Or continue with
        </span>
      </div>

      <Button variant="outline" class="w-full" onclick={onGoogleLogin}>
        <BrandIcon name="google" size={16} colored class="mr-2" />
        Login with Google
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        Don't have an account?
        <button
          type="button"
          class="text-primary underline-offset-4 hover:underline"
          onclick={onSignUp}
        >
          Sign up
        </button>
      </p>
    </CardContent>
  </Card>
</div>
