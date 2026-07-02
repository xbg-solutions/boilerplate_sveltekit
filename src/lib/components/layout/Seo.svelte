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
  let {
    title = undefined,
    description = undefined,
    keywords = undefined,
    image = undefined,
    type = 'website',
    author = undefined,
    publishedTime = undefined,
    modifiedTime = undefined,
    noindex = false,
    nofollow = false
  }: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    type?: 'website' | 'article' | 'product' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    noindex?: boolean;
    nofollow?: boolean;
  } = $props();

  // Get default values from config
  const defaultTitle = APP_CONFIG.seo?.defaultTitle || APP_CONFIG.project.name;
  const defaultDescription = APP_CONFIG.seo?.defaultDescription || APP_CONFIG.project.description;
  const defaultImage = APP_CONFIG.seo?.defaultImage || '/og-image.jpg';
  const defaultKeywords = APP_CONFIG.seo?.defaultKeywords || [];
  const siteName = APP_CONFIG.project.name;
  const twitterHandle = APP_CONFIG.seo?.twitterHandle;

  // Compute final values
  let finalTitle = $derived(title ? `${title} | ${siteName}` : defaultTitle);
  let finalDescription = $derived(description || defaultDescription);
  let finalImage = $derived(image || defaultImage);
  let finalKeywords = $derived(keywords || defaultKeywords);
  let currentUrl = $derived($page.url.href);

  // Make image URL absolute
  let absoluteImageUrl = $derived(finalImage.startsWith('http')
    ? finalImage
    : `${APP_CONFIG.project.url}${finalImage}`);

  // Robots directive
  let robotsContent = $derived([
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', '));
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
  <!-- Every "<" in the JSON is unicode-escaped (u003c): JSON.stringify alone
       does not neutralize a closing-script-tag sequence inside title/
       description/author, which would otherwise break out of this block (XSS) -->
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
  }).replace(/</g, '\\u003c')}<\/script>`}
</svelte:head>