<!--
  SignIn03.svelte
  Dark testimonial panel left + form right with social buttons and OR divider.
  Desktop: 2-col (left 40%, right 60%). Mobile: form only.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface Testimonial {
    quote: string;
    author: string;
    role: string;
  }

  interface Props {
    class?: string;
    title?: string;
    description?: string;
    onsubmit?: (data: { email: string; password: string; remember: boolean }) => void;
    onforgot?: () => void;
    onsignup?: () => void;
    ongoogle?: () => void;
    ogithub?: () => void;
    onapple?: () => void;
    testimonial?: Testimonial;
  }

  let {
    class: className = '',
    title = 'Sign in',
    description = 'Log in to unlock tailored content and stay connected with your community.',
    onsubmit = (_: { email: string; password: string; remember: boolean }) => {},
    onforgot = () => {},
    onsignup = () => {},
    ongoogle = () => {},
    ogithub = () => {},
    onapple = () => {},
    testimonial = {
      quote: 'This platform has transformed the way we collaborate. Highly recommend!',
      author: 'Sarah Johnson',
      role: 'Product Manager'
    }
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
  <!-- Dark testimonial panel -->
  <div class="hidden flex-col justify-between bg-foreground text-background px-8 py-12 md:flex md:w-2/5">
    <!-- Logo -->
    <div class="flex h-8 w-8 items-center justify-center rounded bg-background text-foreground">
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

    <!-- Testimonial -->
    <div class="flex flex-col gap-6">
      <blockquote class="text-lg font-medium leading-relaxed">{testimonial.quote}</blockquote>
      <div>
        <p class="font-medium">{testimonial.author}</p>
        <p class="text-sm text-background/70">{testimonial.role}</p>
      </div>
    </div>
  </div>

  <!-- Form panel -->
  <div class="flex w-full flex-col justify-center px-6 py-12 md:w-3/5 md:px-12 lg:px-16">
    <div class="w-full max-w-sm">
      <!-- Logo (mobile) -->
      <div class="mb-8 flex md:hidden h-8 w-8 items-center justify-center rounded bg-foreground text-background">
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

      <!-- Social buttons -->
      <div class="flex gap-3 mb-6">
        <button
          type="button"
          onclick={ogithub}
          class="flex-1 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
          title="Sign in with GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </button>
        <button
          type="button"
          onclick={ongoogle}
          class="flex-1 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
          title="Sign in with Google"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
          </svg>
        </button>
        <button
          type="button"
          onclick={onapple}
          class="flex-1 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
          title="Sign in with Apple"
        >
          <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.5 0 663 0 541.8c0-207.7 134.4-317.7 265.9-317.7 70.2 0 128.7 46.8 173.4 46.8 43.2 0 111.3-49.3 192.5-49.3 30.6 0 108.2 3.5 162.2 73.1zM603.4 97.5c28.7-34.4 49.3-82.2 49.3-130 0-6.4-.6-12.9-1.9-18.1-46.8 1.9-101.4 31.3-135.2 68.7-26.5 30-50.6 77.8-50.6 126.4 0 7.1 1.3 14.2 1.9 16.4 2.6.3 6.4 1 10.2 1 42.5 0 91.1-28.1 126.3-64.4z" />
          </svg>
        </button>
      </div>

      <!-- OR divider -->
      <div class="mb-6 flex items-center gap-3">
        <div class="flex-1 border-t border-border"></div>
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Or</span>
        <div class="flex-1 border-t border-border"></div>
      </div>

      <!-- Form -->
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
          <div class="flex items-center justify-between">
            <label for="password" class="text-sm font-medium">Password</label>
            <button
              type="button"
              onclick={onforgot}
              class="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            bind:value={password}
            required
            class="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0"
          />
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" bind:checked={remember} class="h-4 w-4 rounded border border-input" />
          Keep me signed in
        </label>

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
  </div>
</div>
