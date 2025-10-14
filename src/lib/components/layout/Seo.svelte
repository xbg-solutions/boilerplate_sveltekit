<!--
  src/lib/components/layout/SEO.svelte
  SEO Meta Tags Component
  
  Automatically generates SEO meta tags from app.config.ts and page-specific overrides.
  
  Usage:
    <SEO title="Page Title" description="Page description" />
    <SEO 
      title="Article Title"
      description="Article description"
      image="/og-image.jpg"
      type="article"
      author="John Doe"
    />
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { APP_CONFIG } from '$lib/config/app.config';

  // Page-specific overrides
  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let keywords: string[] | undefined = undefined;
  export let image: string | undefined = undefined;
  export let type: 'website' | 'article' | 'product' | 'profile' = 'website';
  export let author: string | undefined = undefined;
  export let publishedTime: string | undefined = undefined;
  export let modifiedTime: string | undefined = undefined;
  export let noindex = false;
  export let nofollow = false;

  // Get default values from config
  const defaultTitle = APP_CONFIG.seo?.defaultTitle || APP_CONFIG.project.name;
  const defaultDescription = APP_CONFIG.seo?.defaultDescription || APP_CONFIG.project.description;
  const defaultImage = APP_CONFIG.seo?.defaultImage || '/og-image.jpg';
  const defaultKeywords = APP_CONFIG.seo?.defaultKeywords || [];
  const siteName = APP_CONFIG.project.name;
  const twitterHandle = APP_CONFIG.seo?.twitterHandle;

  // Compute final values
  $: finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  $: finalDescription = description || defaultDescription;
  $: finalImage = image || defaultImage;
  $: finalKeywords = keywords || defaultKeywords;
  $: currentUrl = $page.url.href;
  
  // Make image URL absolute
  $: absoluteImageUrl = finalImage.startsWith('http') 
    ? finalImage 
    : `${APP_CONFIG.project.url}${finalImage}`;

  // Robots directive
  $: robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{finalTitle}</title>
  <meta name="title" content={finalTitle} />
  <meta name="description" content={finalDescription} />
  {#if finalKeywords.length > 0}
    <meta name="keywords" content={finalKeywords.join(', ')} />
  {/if}
  <meta name="robots" content={robotsContent} />
  
  <!-- Canonical URL -->
  <link rel="canonical" href={currentUrl} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:title" content={finalTitle} />
  <meta property="og:description" content={finalDescription} />
  <meta property="og:image" content={absoluteImageUrl} />
  <meta property="og:image:alt" content={finalTitle} />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="en_US" />
  
  {#if type === 'article'}
    {#if author}
      <meta property="article:author" content={author} />
    {/if}
    {#if publishedTime}
      <meta property="article:published_time" content={publishedTime} />
    {/if}
    {#if modifiedTime}
      <meta property="article:modified_time" content={modifiedTime} />
    {/if}
  {/if}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={currentUrl} />
  <meta name="twitter:title" content={finalTitle} />
  <meta name="twitter:description" content={finalDescription} />
  <meta name="twitter:image" content={absoluteImageUrl} />
  {#if twitterHandle}
    <meta name="twitter:site" content={twitterHandle} />
    <meta name="twitter:creator" content={twitterHandle} />
  {/if}
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#29465B" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Structured Data (JSON-LD) -->
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    headline: finalTitle,
    description: finalDescription,
    image: absoluteImageUrl,
    url: currentUrl,
    author: author ? {
      '@type': 'Person',
      name: author
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_CONFIG.project.url}/logo.png`
      }
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime
  })}<\/script>`}
</svelte:head>