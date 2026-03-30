<!--
  LoginBlock03.svelte
  Minimal email-only login form.
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
    Input,
    Label
  } from '$lib/components/ui';

  let {
    class: className = '',
    onSubmit = undefined
  }: {
    class?: string;
    onSubmit?: ((email: string) => void) | undefined;
  } = $props();

  let email = $state('');

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
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
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
