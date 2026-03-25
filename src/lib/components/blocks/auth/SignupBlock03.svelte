<!--
  SignupBlock03.svelte
  Create account form with terms checkbox.
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
    CardFooter,
    Input,
    Label,
    Checkbox
  } from '$lib/components/ui';
  import { BrandIcon } from '$lib/components/ui/icon';

  let className: string = '';
  export { className as class };

  export let onSubmit: ((data: { name: string; email: string; password: string; acceptedTerms: boolean }) => void) | undefined = undefined;
  export let onGoogleSignup: (() => void) | undefined = undefined;
  export let onSignIn: (() => void) | undefined = undefined;
  export let onTermsClick: (() => void) | undefined = undefined;
  export let onPrivacyClick: (() => void) | undefined = undefined;

  let name = '';
  let email = '';
  let password = '';
  let acceptedTerms = false;

  function handleSubmit() {
    onSubmit?.({ name, email, password, acceptedTerms });
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-2xl">Create an account</CardTitle>
      <CardDescription>Enter your information below to create your account</CardDescription>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="signup03-name">Full name</Label>
          <Input
            type="text"
            placeholder="John Doe"
            bind:value={name}
          />
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup03-email">Email</Label>
          <Input
            type="email"
            placeholder="m@example.com"
            bind:value={email}
          />
        </div>
        <div class="space-y-2">
          <Label htmlFor="signup03-password">Password</Label>
          <Input
            type="password"
            bind:value={password}
          />
          <p class="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
        </div>
        <div class="flex items-start space-x-2">
          <Checkbox bind:checked={acceptedTerms} />
          <label class="text-sm text-muted-foreground leading-none">
            I agree to the
            <button
              type="button"
              class="text-primary underline-offset-4 hover:underline"
              on:click={onTermsClick}
            >
              Terms of Service
            </button>
            and
            <button
              type="button"
              class="text-primary underline-offset-4 hover:underline"
              on:click={onPrivacyClick}
            >
              Privacy Policy
            </button>
          </label>
        </div>
        <Button type="submit" class="w-full">Create Account</Button>
        <Button variant="outline" type="button" class="w-full" on:click={onGoogleSignup}>
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
          on:click={onSignIn}
        >
          Sign in
        </button>
      </p>
    </CardFooter>
  </Card>
</div>
