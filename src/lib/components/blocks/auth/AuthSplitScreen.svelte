<!--
  AuthSplitScreen.svelte
  Split-screen auth layout with dark branded panel on left and form slot on right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Input,
    Label,
    Separator
  } from '$lib/components/ui';
  import { BrandIcon } from '$lib/components/ui/icon';

  let className: string = '';
  export { className as class };

  export let brandName: string = 'Acme Inc.';
  export let brandLogo: string = '';
  export let testimonialQuote: string = '';
  export let testimonialAuthor: string = '';

  export let onEmailSubmit: ((email: string) => void) | undefined = undefined;
  export let onGithubLogin: (() => void) | undefined = undefined;
  export let onTermsClick: (() => void) | undefined = undefined;
  export let onPrivacyClick: (() => void) | undefined = undefined;

  let email = '';

  function handleEmailSubmit() {
    onEmailSubmit?.(email);
  }
</script>

<div class={cn('grid min-h-screen lg:grid-cols-2', className)}>
  <!-- Left panel: dark branded area -->
  <div class="relative hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-10">
    <div class="flex items-center gap-2 text-primary-foreground">
      {#if brandLogo}
        <img src={brandLogo} alt={brandName} class="h-6 w-6" />
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
      {/if}
      <span class="text-lg font-semibold">{brandName}</span>
    </div>

    {#if testimonialQuote}
      <div class="text-primary-foreground">
        <blockquote class="space-y-2">
          <p class="text-lg">&ldquo;{testimonialQuote}&rdquo;</p>
          {#if testimonialAuthor}
            <footer class="text-sm text-primary-foreground/80">{testimonialAuthor}</footer>
          {/if}
        </blockquote>
      </div>
    {:else}
      <div></div>
    {/if}
  </div>

  <!-- Right panel: auth form -->
  <div class="flex items-center justify-center p-6 lg:p-8">
    <div class="w-full max-w-sm space-y-6">
      <slot>
        <!-- Default content if no slot is provided -->
        <div class="space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p class="text-sm text-muted-foreground">Enter your email below to create your account</p>
        </div>

        <form on:submit|preventDefault={handleEmailSubmit} class="space-y-4">
          <div class="space-y-2">
            <Label htmlFor="split-email">Email</Label>
            <Input
              type="email"
              placeholder="m@example.com"
              bind:value={email}
            />
          </div>
          <Button type="submit" class="w-full">Sign in with Email</Button>
        </form>

        <div class="relative">
          <Separator />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs uppercase text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button variant="outline" class="w-full" on:click={onGithubLogin}>
          <BrandIcon name="github" size={16} class="mr-2" />
          GitHub
        </Button>

        <p class="text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our
          <button
            type="button"
            class="underline underline-offset-4 hover:text-primary"
            on:click={onTermsClick}
          >
            Terms of Service
          </button>
          and
          <button
            type="button"
            class="underline underline-offset-4 hover:text-primary"
            on:click={onPrivacyClick}
          >
            Privacy Policy
          </button>.
        </p>
      </slot>
    </div>
  </div>
</div>
