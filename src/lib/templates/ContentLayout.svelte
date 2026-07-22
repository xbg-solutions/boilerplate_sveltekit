<!--
  ContentLayout.svelte
  Content-focused layout template with optional breadcrumbs and sidebar

  Usage:
  <ContentLayout title="Article Title" showBreadcrumbs={true}
    sidebar={sidebarSnippet}
    actions={actionsSnippet}
  >
    Main content here
  </ContentLayout>
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { Card, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, Separator, Badge } from '$lib/components/ui';
  import { Calendar, Clock, Tag, Share2, Bookmark } from 'lucide-svelte';

  // Component props
  let {
    title = '',
    subtitle = '',
    showBreadcrumbs = false,
    breadcrumbs = [],
    showSidebar = false,
    sidebarPosition = 'right',
    maxWidth = '4xl',
    showMeta = false,
    publishDate = '',
    readTime = '',
    tags = [],
    author = null,
    actions,
    sidebar,
    footer,
    children
  }: {
    title?: string;
    subtitle?: string;
    showBreadcrumbs?: boolean;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    showSidebar?: boolean;
    sidebarPosition?: 'left' | 'right';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
    showMeta?: boolean;
    publishDate?: string;
    readTime?: string;
    tags?: string[];
    author?: {
      name: string;
      avatar?: string;
      bio?: string;
    } | null;
    actions?: Snippet;
    sidebar?: Snippet;
    footer?: Snippet;
    children?: Snippet;
  } = $props();

  // Computed classes
  let maxWidthClass = $derived(getMaxWidthClass(maxWidth));
  let gridClass = $derived(showSidebar ? 'grid grid-cols-1 lg:grid-cols-4 gap-8' : '');
  let contentClass = $derived(showSidebar ? 'lg:col-span-3' : '');
  let sidebarClass = $derived(showSidebar && sidebarPosition === 'left' ? 'lg:order-first' : '');

  // Auto-generate breadcrumbs from route if not provided
  $effect(() => {
    if (showBreadcrumbs && breadcrumbs.length === 0) {
      breadcrumbs = generateBreadcrumbs($page.url.pathname);
    }
  });

  function getMaxWidthClass(size: typeof maxWidth): string {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case '6xl': return 'max-w-6xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-4xl';
    }
  }

  function generateBreadcrumbs(pathname: string): Array<{ label: string; href?: string }> {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/' }];

    let path = '';
    for (let i = 0; i < segments.length; i++) {
      path += '/' + segments[i];
      const isLast = i === segments.length - 1;
      breadcrumbs.push({
        label: segments[i].charAt(0).toUpperCase() + segments[i].slice(1),
        href: isLast ? undefined : path
      });
    }

    return breadcrumbs;
  }

  function formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  {#if title}
    <title>{title}</title>
  {/if}
  {#if subtitle}
    <meta name="description" content={subtitle} />
  {/if}
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="mx-auto px-4 sm:px-6 lg:px-8 {maxWidthClass}">
    <!-- Breadcrumbs -->
    {#if showBreadcrumbs && breadcrumbs.length > 0}
      <nav class="mb-8" aria-label="Breadcrumb">
        <Breadcrumb>
          {#each breadcrumbs as crumb, index}
            <BreadcrumbItem>
              {#if crumb.href}
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              {:else}
                <span class="text-gray-500">{crumb.label}</span>
              {/if}
            </BreadcrumbItem>
            {#if index < breadcrumbs.length - 1}
              <BreadcrumbSeparator />
            {/if}
          {/each}
        </Breadcrumb>
      </nav>
    {/if}

    <!-- Header -->
    {#if title || subtitle || actions}
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div class="flex-1">
            {#if title}
              <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {title}
              </h1>
            {/if}
            {#if subtitle}
              <p class="text-xl text-gray-600 leading-relaxed">
                {subtitle}
              </p>
            {/if}
          </div>

          {#if actions}
            <div class="flex-shrink-0">
              {@render actions()}
            </div>
          {/if}
        </div>

        <!-- Meta information -->
        {#if showMeta && (author || publishDate || readTime || tags.length > 0)}
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              {#if author}
                <div class="flex items-center space-x-3">
                  {#if author.avatar}
                    <img src={author.avatar} alt={author.name} class="h-8 w-8 rounded-full" />
                  {:else}
                    <div class="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                  {/if}
                  <div>
                    <p class="font-medium text-gray-900">{author.name}</p>
                    {#if author.bio}
                      <p class="text-gray-600">{author.bio}</p>
                    {/if}
                  </div>
                </div>
              {/if}

              {#if publishDate}
                <div class="flex items-center space-x-1">
                  <Calendar class="h-4 w-4" />
                  <span>{formatDate(publishDate)}</span>
                </div>
              {/if}

              {#if readTime}
                <div class="flex items-center space-x-1">
                  <Clock class="h-4 w-4" />
                  <span>{readTime}</span>
                </div>
              {/if}

              {#if tags.length > 0}
                <div class="flex items-center space-x-2">
                  <Tag class="h-4 w-4" />
                  <div class="flex flex-wrap gap-2">
                    {#each tags as tag}
                      <Badge variant="secondary">{tag}</Badge>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </header>
    {/if}

    <!-- Main content area -->
    <div class={gridClass}>
      <!-- Sidebar (left side if position is left) -->
      {#if showSidebar && sidebarPosition === 'left'}
        <aside class="space-y-6 {sidebarClass}">
          {#if sidebar}
            {@render sidebar()}
          {:else}
            <!-- Default sidebar content -->
            <Card class="p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Share2 class="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button class="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Bookmark class="h-4 w-4" />
                  <span>Bookmark</span>
                </button>
              </div>
            </Card>
          {/if}
        </aside>
      {/if}

      <!-- Main content -->
      <main class={contentClass}>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <article class="prose prose-lg max-w-none p-8">
            {@render children?.()}
          </article>
        </div>
      </main>

      <!-- Sidebar (right side if position is right) -->
      {#if showSidebar && sidebarPosition === 'right'}
        <aside class="space-y-6">
          {#if sidebar}
            {@render sidebar()}
          {:else}
            <!-- Default sidebar content -->
            <Card class="p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav class="space-y-2 text-sm">
                <a href="#section-1" class="block text-gray-600 hover:text-gray-900">Section 1</a>
                <a href="#section-2" class="block text-gray-600 hover:text-gray-900">Section 2</a>
                <a href="#section-3" class="block text-gray-600 hover:text-gray-900">Section 3</a>
              </nav>
            </Card>

            <Card class="p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button class="flex items-center space-x-2 w-full text-left text-gray-600 hover:text-gray-900">
                  <Share2 class="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button class="flex items-center space-x-2 w-full text-left text-gray-600 hover:text-gray-900">
                  <Bookmark class="h-4 w-4" />
                  <span>Bookmark</span>
                </button>
              </div>
            </Card>
          {/if}
        </aside>
      {/if}
    </div>

    <!-- Footer content -->
    {#if footer}
      <footer class="mt-12 pt-8 border-t border-gray-200">
        {@render footer()}
      </footer>
    {/if}
  </div>
</div>

<style>
  /* Prose styling for main content */
  .prose {
    color: theme('colors.gray.700');
    line-height: 1.75;
  }

  .prose h1,
  .prose :global(h2),
  .prose h3,
  .prose :global(h4),
  .prose :global(h5),
  .prose :global(h6) {
    color: theme('colors.gray.900');
    font-weight: 600;
    margin-top: 2em;
    margin-bottom: 1em;
  }

  .prose h1 {
    font-size: 1.875rem;
    line-height: 1.25;
  }

  .prose :global(h2) {
    font-size: 1.5rem;
    line-height: 1.375;
  }

  .prose h3 {
    font-size: 1.25rem;
    line-height: 1.5;
  }

  .prose p {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
  }

  .prose img {
    border-radius: 0.5rem;
    margin: 2em auto;
  }

  .prose :global(blockquote) {
    border-left: 4px solid theme('colors.primary.DEFAULT');
    padding-left: 1rem;
    font-style: italic;
    margin: 1.5em 0;
  }

  .prose :global(code) {
    background-color: theme('colors.gray.100');
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  .prose :global(pre) {
    background-color: theme('colors.gray.900');
    color: theme('colors.gray.100');
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5em 0;
  }

  .prose :global(pre code) {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }

  .prose :global(ul),
  .prose :global(ol) {
    margin: 1.25em 0;
    padding-left: 1.5em;
  }

  .prose :global(li) {
    margin: 0.5em 0;
  }

  .prose a {
    color: theme('colors.primary.DEFAULT');
    text-decoration: underline;
    text-decoration-color: theme('colors.primary.DEFAULT / 0.5');
    text-underline-offset: 2px;
  }

  .prose a:hover {
    text-decoration-color: theme('colors.primary.DEFAULT');
  }
</style>