<!--
  OtpBlock05.svelte
  Compact OTP verification with single-line input.
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
    onVerify = undefined,
    onResend = undefined,
    email = ''
  }: {
    class?: string;
    onVerify?: ((code: string) => void) | undefined;
    onResend?: (() => void) | undefined;
    email?: string;
  } = $props();

  let code = $state('');

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    code = target.value.replace(/\D/g, '').slice(0, 6);
  }

  function handleSubmit() {
    onVerify?.(code);
  }
</script>

<div class={cn('flex min-h-screen items-center justify-center p-4', className)}>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-2xl">Enter verification code</CardTitle>
      <CardDescription>
        We sent a 6-digit code to {email || 'your email'}.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
        <div class="space-y-2">
          <Label>Verification code</Label>
          <Input
            type="text"
            inputmode="numeric"
            placeholder="000000"
            value={code}
            class="text-center text-lg tracking-[0.5em] font-mono"
            oninput={handleInput}
          />
          <p class="text-xs text-muted-foreground text-center">Enter the 6-digit code sent to your email.</p>
        </div>
        <Button type="submit" class="w-full">Verify</Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center">
      <p class="text-sm text-muted-foreground">
        Didn't receive the code?
        <button
          type="button"
          class="text-primary underline-offset-4 hover:underline"
          onclick={onResend}
        >
          Resend
        </button>
      </p>
    </CardFooter>
  </Card>
</div>
