# SEO Optimization Utilities

## Overview

SEO utilities for meta tags, structured data, sitemaps, and SEO auditing.

**Location:** `src/lib/utils/seo.ts`

## Key Functions

### generateMetaTags
Generate meta tags for SEO.

```typescript
const tags = generateMetaTags({
  title: 'My Page',
  description: 'Page description',
  image: '/og-image.jpg',
  canonical: 'https://example.com/page',
  type: 'article',
  keywords: ['keyword1', 'keyword2']
});
// Returns array of MetaTag objects for og: and twitter: tags
```

### generateStructuredData
Generate JSON-LD structured data.

```typescript
const schema = generateStructuredData({
  title: 'Article Title',
  description: 'Article description',
  type: 'article',
  url: 'https://example.com/article',
  publishedTime: '2024-01-01T00:00:00Z',
  author: 'John Doe'
});
// Returns Schema.org JSON-LD object
```

### auditSEO
Audit current page SEO.

```typescript
const audit = auditSEO();
// {
//   score: 85,
//   issues: ['Missing meta description', ...],
//   recommendations: ['Optimize title length', ...]
// }
```

### generateSitemapXML
Generate sitemap XML.

```typescript
const sitemap = generateSitemapXML([
  { url: '/', lastModified: '2024-01-01', priority: 1.0 },
  { url: '/about', changeFreq: 'monthly', priority: 0.8 }
]);
```

### generateRobotsTxt
Generate robots.txt content.

```typescript
const robots = generateRobotsTxt({
  sitemap: '/sitemap.xml',
  disallow: ['/admin', '/private'],
  allow: ['/api/public'],
  crawlDelay: 10
});
```

## SEO Utils Object

Development helpers.

```typescript
// Log SEO audit in console
seoUtils.logAudit();

// Preview search result appearance
const preview = seoUtils.previewSearchResult();
// { title: '...', url: '...', description: '...' }

// Get page insights
const insights = seoUtils.getPageInsights();
// { wordCount, readingTime, headingStructure, links }
```

## Common Patterns

### Page Meta Tags
```svelte
<script>
  import { generateMetaTags } from '$lib/utils/seo';
  
  const metaTags = generateMetaTags({
    title: 'My Page',
    description: 'Description here',
    image: '/og-image.jpg'
  });
</script>

<svelte:head>
  <title>{metaTags.find(t => t.property === 'og:title')?.content}</title>
  {#each metaTags as tag}
    {#if tag.name}
      <meta name={tag.name} content={tag.content} />
    {:else if tag.property}
      <meta property={tag.property} content={tag.content} />
    {/if}
  {/each}
</svelte:head>
```

### Structured Data
```svelte
<svelte:head>
  <script type="application/ld+json">
    {JSON.stringify(structuredData)}
  </script>
</svelte:head>
```

### Sitemap Route
```typescript
// +server.ts
import { generateSitemapXML } from '$lib/utils/seo';

export async function GET() {
  const urls = await getAllPageUrls();
  const sitemap = generateSitemapXML(urls);
  
  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

## Best Practices

1. Unique titles (30-60 chars)
2. Descriptions (120-160 chars)
3. Use canonical URLs
4. Add Open Graph images
5. One H1 per page
6. Alt text on images
7. Proper heading hierarchy
8. Fast page load times
9. Use HTTPS
10. Mobile viewport meta
