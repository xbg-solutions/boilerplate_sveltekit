<!--
  OtpBlock04.svelte
  OTP verification with "Try another method" link.
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
    Label
  } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  export let onVerify: ((code: string) => void) | undefined = undefined;
  export let onResend: (() => void) | undefined = undefined;
  export let onTryAnotherMethod: (() => void) | undefined = undefined;
  export let email: string = '';

  let digits: string[] = ['', '', '', '', '', ''];
  let inputs: HTMLInputElement[] = [];

  function handleInput(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (value.length > 1) {
      digits[index] = value.slice(-1);
    }

    if (value && index < 5) {
      inputs[index + 1]?.focus();
    }
  }

  function handleKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const chars = pasted.replace(/\D/g, '').slice(0, 6).split('');
    chars.forEach((char, i) => {
      digits[i] = char;
    });
    const nextIndex = Math.min(chars.length, 5);
    inputs[nextIndex]?.focus();
  }

  function handleSubmit() {
    onVerify?.(digits.join(''));
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
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label>Verification code</Label>
          <div class="flex gap-2 justify-center">
            {#each digits as digit, i}
              <input
                bind:this={inputs[i]}
                bind:value={digits[i]}
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="flex h-12 w-12 items-center justify-center rounded-md border border-input bg-background text-center text-lg font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                on:input={(e) => handleInput(i, e)}
                on:keydown={(e) => handleKeydown(i, e)}
                on:paste={handlePaste}
              />
            {/each}
          </div>
          <p class="text-xs text-muted-foreground text-center">Enter the 6-digit code sent to your email.</p>
        </div>
        <Button type="submit" class="w-full">Verify</Button>
      </form>
    </CardContent>
    <CardFooter class="flex-col space-y-2">
      <p class="text-sm text-muted-foreground">
        Didn't receive the code?
        <button
          type="button"
          class="text-primary underline-offset-4 hover:underline"
          on:click={onResend}
        >
          Resend
        </button>
      </p>
      <button
        type="button"
        class="text-sm text-muted-foreground underline-offset-4 hover:underline"
        on:click={onTryAnotherMethod}
      >
        Try another method
      </button>
    </CardFooter>
  </Card>
</div>
