<!--
  FormLayout.svelte
  Centered form layout template with optional sidebar
  
  Usage:
  <FormLayout title="Login" description="Sign in to your account">
    <form slot="form">
      <!-- Form content -->
    </form>
    <div slot="sidebar">
      <!-- Optional sidebar content -->
    </div>
  </FormLayout>
-->
<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator } from '$lib/components/ui';
  
  // Component props
  export let title: string = '';
  export let description: string = '';
  export let showSidebar: boolean = false;
  export let sidebarWidth: 'sm' | 'md' | 'lg' = 'md';
  export let maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  export let centered: boolean = true;
  export let showLogo: boolean = true;
  export let logoSrc: string = '';
  export let logoAlt: string = 'Logo';
  export let backgroundColor: 'white' | 'gray' | 'gradient' = 'gray';
  
  // Computed classes
  $: containerClasses = `min-h-screen ${getBackgroundClasses(backgroundColor)} ${centered ? 'flex items-center justify-center' : 'py-12'} px-4 sm:px-6 lg:px-8`;
  $: maxWidthClass = getMaxWidthClass(maxWidth);
  $: sidebarWidthClass = getSidebarWidthClass(sidebarWidth);
  
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
          
          <slot name="form" />
          
          <slot name="form-footer" />
        </div>
        
        <!-- Sidebar section -->
        <div class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground {sidebarWidthClass} p-8 flex flex-col justify-center">
          <slot name="sidebar">
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
          </slot>
        </div>
      </div>
    {:else}
      <!-- Single card layout -->
      <Card className="shadow-xl">
        {#if showLogo && logoSrc}
          <div class="flex justify-center pt-8 mb-4">
            <img src={logoSrc} alt={logoAlt} class="h-12 w-auto" />
          </div>
        {/if}
        
        {#if title || description}
          <CardHeader className="text-center pb-4">
            {#if title}
              <CardTitle className="text-3xl font-bold text-gray-900">{title}</CardTitle>
            {/if}
            {#if description}
              <CardDescription className="text-gray-600 mt-2">{description}</CardDescription>
            {/if}
          </CardHeader>
        {/if}
        
        <CardContent className="px-8 pb-8">
          <slot name="form" />
          
          {#if $$slots['form-footer']}
            <Separator className="my-6" />
            <slot name="form-footer" />
          {/if}
        </CardContent>
      </Card>
    {/if}
    
    <!-- Footer content -->
    {#if $$slots.footer}
      <div class="mt-8 text-center">
        <slot name="footer" />
      </div>
    {/if}
  </div>
</div>

<!-- Loading overlay slot -->
{#if $$slots.loading}
  <slot name="loading" />
{/if}

<style>
  /* Custom gradient background */
  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
  }
</style>