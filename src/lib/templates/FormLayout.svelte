<!--
  FormLayout.svelte
  Centered form layout template with optional sidebar

  Usage:
  <FormLayout title="Login" description="Sign in to your account"
    form={formSnippet}
    sidebar={sidebarSnippet}
  />
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator } from '$lib/components/ui';

  // Component props
  let {
    title = '',
    description = '',
    showSidebar = false,
    sidebarWidth = 'md',
    maxWidth = 'md',
    centered = true,
    showLogo = true,
    logoSrc = '',
    logoAlt = 'Logo',
    backgroundColor = 'gray',
    form,
    'form-footer': formFooter,
    sidebar,
    footer,
    loading
  }: {
    title?: string;
    description?: string;
    showSidebar?: boolean;
    sidebarWidth?: 'sm' | 'md' | 'lg';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    centered?: boolean;
    showLogo?: boolean;
    logoSrc?: string;
    logoAlt?: string;
    backgroundColor?: 'white' | 'gray' | 'gradient';
    form?: Snippet;
    'form-footer'?: Snippet;
    sidebar?: Snippet;
    footer?: Snippet;
    loading?: Snippet;
  } = $props();

  // Computed classes
  let containerClasses = $derived(`min-h-screen ${getBackgroundClasses(backgroundColor)} ${centered ? 'flex items-center justify-center' : 'py-12'} px-4 sm:px-6 lg:px-8`);
  let maxWidthClass = $derived(getMaxWidthClass(maxWidth));
  let sidebarWidthClass = $derived(getSidebarWidthClass(sidebarWidth));

  function getBackgroundClasses(bg: typeof backgroundColor): string {
    switch (bg) {
      case 'white':
        return 'bg-white';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100';
      default:
        return 'bg-gray-50';
    }
  }

  function getMaxWidthClass(size: typeof maxWidth): string {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  }

  function getSidebarWidthClass(size: typeof sidebarWidth): string {
    switch (size) {
      case 'sm': return 'w-1/3';
      case 'lg': return 'w-1/2';
      default: return 'w-2/5';
    }
  }
</script>

<svelte:head>
  {#if title}
    <title>{title}</title>
  {/if}
  {#if description}
    <meta name="description" content={description} />
  {/if}
</svelte:head>

<div class={containerClasses}>
  <div class="w-full {maxWidthClass}">
    {#if showSidebar}
      <!-- Two-column layout with sidebar -->
      <div class="flex rounded-lg overflow-hidden shadow-xl bg-white">
        <!-- Form section -->
        <div class="flex-1 p-8">
          {#if showLogo && logoSrc}
            <div class="flex justify-center mb-8">
              <img src={logoSrc} alt={logoAlt} class="h-12 w-auto" />
            </div>
          {/if}

          {#if title || description}
            <div class="text-center mb-8">
              {#if title}
                <h2 class="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              {/if}
              {#if description}
                <p class="text-gray-600">{description}</p>
              {/if}
            </div>
          {/if}

          {@render form?.()}

          {@render formFooter?.()}
        </div>

        <!-- Sidebar section -->
        <div class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground {sidebarWidthClass} p-8 flex flex-col justify-center">
          {#if sidebar}
            {@render sidebar()}
          {:else}
            <div class="space-y-6">
              <h3 class="text-2xl font-semibold">Welcome back!</h3>
              <p class="text-primary-foreground/90 leading-relaxed">
                Continue your journey with us. Access your dashboard and manage your account with ease.
              </p>
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span class="text-primary-foreground/90">Secure authentication</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span class="text-primary-foreground/90">Protected data</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span class="text-primary-foreground/90">24/7 support</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Single card layout -->
      <Card class="shadow-xl">
        {#if showLogo && logoSrc}
          <div class="flex justify-center pt-8 mb-4">
            <img src={logoSrc} alt={logoAlt} class="h-12 w-auto" />
          </div>
        {/if}

        {#if title || description}
          <CardHeader class="text-center pb-4">
            {#if title}
              <CardTitle class="text-3xl font-bold text-gray-900">{title}</CardTitle>
            {/if}
            {#if description}
              <CardDescription class="text-gray-600 mt-2">{description}</CardDescription>
            {/if}
          </CardHeader>
        {/if}

        <CardContent class="px-8 pb-8">
          {@render form?.()}

          {#if formFooter}
            <Separator class="my-6" />
            {@render formFooter()}
          {/if}
        </CardContent>
      </Card>
    {/if}

    <!-- Footer content -->
    {#if footer}
      <div class="mt-8 text-center">
        {@render footer()}
      </div>
    {/if}
  </div>
</div>

<!-- Loading overlay slot -->
{#if loading}
  {@render loading()}
{/if}

<style>
  /* Custom gradient background */
  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
  }
</style>