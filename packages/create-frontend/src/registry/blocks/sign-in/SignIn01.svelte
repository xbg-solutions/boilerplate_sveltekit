<!--
  SignIn01.svelte
  Split layout: form left (white bg) + image placeholder right (gray bg).
  Desktop: 2-col (form ~40%, image ~60%). Mobile: form only.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface Props {
    class?: string;
    title?: string;
    description?: string;
    onsubmit?: (data: { email: string; password: string; remember: boolean }) => void;
    onforgot?: () => void;
    onsignup?: () => void;
  }

  let {
    class: className = '',
    title = 'Sign in',
    description = 'Log in to unlock tailored content and stay connected with your community.',
    onsubmit = (_: { email: string; password: string; remember: boolean }) => {},
    onforgot = () => {},
    onsignup = () => {}
  }: Props = $props();

  let email = $state('');
  let password = $state('');
  let remember = $state(false);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onsubmit({ email, password, remember });
  }
</script>

<div class={cn('flex min-h-screen bg-background', className)}>
  <!-- Form panel -->
  <div class="flex w-full flex-col justify-center px-6 py-12 md:w-2/5 md:border-r">
    <!-- Logo -->
    <div class="mb-8 flex h-8 w-8 items-center justify-center rounded bg-foreground text-background">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
        />
      </svg>
    </div>

    <h1 class="mb-1 text-2xl font-bold">{title}</h1>
    {#if description}
      <p class="mb-6 text-sm text-muted-foreground">{description}</p>
    {/if}

    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label for="email" class="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          bind:value={email}
          required
          class="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="password" class="text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          required
          class="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0"
        />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" bind:checked={remember} class="h-4 w-4 rounded border border-input" />
          Keep me signed in
        </label>
        <button
          type="button"
          onclick={onforgot}
          class="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" class="w-full">Sign in</Button>
    </form>

    <p class="mt-4 text-center text-sm text-muted-foreground">
      Don't have an account?{' '}
      <button
        type="button"
        onclick={onsignup}
        class="font-medium text-foreground hover:underline transition-colors"
      >
        Sign up
      </button>
    </p>
  </div>

  <!-- Image panel -->
  <div class="hidden flex-1 items-center justify-center bg-muted md:flex">
    <div class="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-muted-foreground/40"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  </div>
</div>
