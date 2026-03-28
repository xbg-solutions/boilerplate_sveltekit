<!--
  src/lib/components/ui/otp-input/OtpInput.svelte
  OTP code entry with auto-focus behavior.

  Usage:
  <OtpInput bind:value length={6} onComplete={handleComplete} />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    length = 6,
    value = $bindable(''),
    class: className = '',
    onComplete,
    onfocus,
    onblur,
    ...rest
  }: {
    length?: number;
    value?: string;
    class?: string;
    onComplete?: (value: string) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
    [key: string]: unknown;
  } = $props();

  let inputs: HTMLInputElement[] = $state([]);
  let digits: string[] = $state([]);

  // Initialize digits from value
  $effect(() => {
    digits = value.split('').slice(0, length);
    while (digits.length < length) digits.push('');
  });

  // Sync value from digits
  function updateValue() {
    value = digits.join('');
    if (value.length === length && !digits.includes('')) {
      onComplete?.(value);
    }
  }

  function handleInput(index: number, e: Event) {
    const target = e.target as HTMLInputElement;
    const char = target.value.replace(/\D/g, '').slice(-1);

    digits[index] = char;
    digits = digits;
    updateValue();

    if (char && index < length - 1) {
      inputs[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputs[index - 1]?.focus();
        digits[index - 1] = '';
        digits = digits;
        updateValue();
      } else {
        digits[index] = '';
        digits = digits;
        updateValue();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputs[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, length);
    for (let i = 0; i < length; i++) {
      digits[i] = pasted[i] || '';
    }
    digits = digits;
    updateValue();

    const focusIndex = Math.min(pasted.length, length - 1);
    inputs[focusIndex]?.focus();
  }
</script>

<div class={cn('flex items-center gap-2', className)} {...rest}>
  {#each Array(length) as _, i}
    <input
      bind:this={inputs[i]}
      type="text"
      inputmode="numeric"
      maxlength="1"
      value={digits[i] || ''}
      class="h-10 w-10 rounded-md border border-input bg-background text-center text-sm font-medium shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      oninput={(e) => handleInput(i, e)}
      onkeydown={(e) => handleKeyDown(i, e)}
      onpaste={handlePaste}
      {onfocus}
      {onblur}
    />
  {/each}
</div>
