<!--
  LoginBlock03.svelte
  Minimal email-only login form.
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
    Label
  } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  export let onSubmit: ((email: string) => void) | undefined = undefined;

  let email = '';

  function handleSubmit() {
    onSubmit?.(email);
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-2xl">Login to your account</CardTitle>
      <CardDescription>Enter your email below to login to your account</CardDescription>
    </CardHeader>
    <CardContent>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="login03-email">Email</Label>
          <Input
            type="email"
            placeholder="m@example.com"
            bind:value={email}
          />
        </div>
        <Button type="submit" class="w-full">Login</Button>
      </form>
    </CardContent>
  </Card>
</div>
