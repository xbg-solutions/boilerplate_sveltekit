<!--
  src/lib/components/layout/PageHeader.svelte
  Page Header Component with Navigation
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.store';
  import HeaderNav from './HeaderNav.svelte';
  
  /**
   * Reusable page header component with title and navigation
   */
  
  // Props
  export let title: string = "SvelteKit Boilerplate";
  export let subtitle: string = '';
  export let centered: boolean = false;
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  export let accentColor: boolean = true;
  // Export constant instead of unused let prop
  export const marginBottom = 'mb-0';
  export let showNav: boolean = true;
  export let isProtected: boolean = false;
  
  // Title size classes
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };
  
  // Computed classes
  $: titleClass = [
    size === 'lg' ? 'text-2xl' : sizeClasses[size],
    'font-bold',
    subtitle ? 'mb-2' : ''
  ].filter(Boolean).join(' ');
  
  $: subtitleClass = [
    size === 'sm' ? 'text-sm' : 'text-base',
    'text-gray-600'
  ].filter(Boolean).join(' ');
  
  $: headerContainerClass = [
    isProtected ? 'shadow-sm' : 'border-b border-gray-200',
    'bg-white w-full'
  ].filter(Boolean).join(' ');
  
  $: headerContentClass = [
    'container mx-auto px-4 py-3 flex justify-between items-center'
  ].join(' ');
  
  $: titleContainerClass = [
    centered ? 'text-center' : '',
    'logo-container'
  ].filter(Boolean).join(' ');
  
  // Accent color style
  $: titleStyle = accentColor ? 'color: var(--accent)' : '';
  
  // Get claims from the auth store
  let claims: Record<string, any> | null = null;
  let isAuthenticated = false;
  
  // Subscribe to the auth store
  authStore.subscribe((state) => {
    if (!state) return;
    isAuthenticated = state?.isAuthenticated || false;
    claims = state?.claims || null;
  });
</script>

<header class={headerContainerClass}>
  <div class={headerContentClass}>
    <div class={titleContainerClass}>
      <h1 class={titleClass} style={titleStyle}>
        <slot name="pre-title"></slot>
        {title}
        <slot name="post-title"></slot>
      </h1>
      
      {#if subtitle}
        <p class={subtitleClass}>
          <slot name="pre-subtitle"></slot>
          {subtitle}
          <slot name="post-subtitle"></slot>
        </p>
      {/if}
    </div>
    
    {#if showNav}
      <HeaderNav {isAuthenticated} {claims} />
    {/if}
    
    <slot name="header-actions"></slot>
  </div>
  
  <slot></slot>
</header>