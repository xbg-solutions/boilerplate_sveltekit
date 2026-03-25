/**
 * SEO Optimization Utilities
 * 
 * Tools for improving search engine optimization
 */

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  locale?: string;
}

/**
 * Generate meta tags for SEO
 */
export function generateMetaTags(data: SEOData): MetaTag[] {
  const tags: MetaTag[] = [];

  // Basic meta tags
  if (data.description) {
    tags.push({ name: 'description', content: data.description });
  }

  if (data.keywords && data.keywords.length > 0) {
    tags.push({ name: 'keywords', content: data.keywords.join(', ') });
  }

  if (data.author) {
    tags.push({ name: 'author', content: data.author });
  }

  // Open Graph tags
  tags.push({ property: 'og:title', content: data.title });
  tags.push({ property: 'og:description', content: data.description });
  tags.push({ property: 'og:type', content: data.type || 'website' });

  if (data.image) {
    tags.push({ property: 'og:image', content: data.image });
    tags.push({ property: 'og:image:alt', content: data.title });
  }

  if (data.canonical) {
    tags.push({ property: 'og:url', content: data.canonical });
  }

  if (data.siteName) {
    tags.push({ property: 'og:site_name', content: data.siteName });
  }

  if (data.locale) {
    tags.push({ property: 'og:locale', content: data.locale });
  }

  if (data.publishedTime) {
    tags.push({ property: 'article:published_time', content: data.publishedTime });
  }

  if (data.modifiedTime) {
    tags.push({ property: 'article:modified_time', content: data.modifiedTime });
  }

  if (data.author && data.type === 'article') {
    tags.push({ property: 'article:author', content: data.author });
  }

  // Twitter Card tags
  tags.push({ name: 'twitter:card', content: 'summary_large_image' });
  tags.push({ name: 'twitter:title', content: data.title });
  tags.push({ name: 'twitter:description', content: data.description });

  if (data.image) {
    tags.push({ name: 'twitter:image', content: data.image });
  }

  return tags;
}

/**
 * Generate structured data (JSON-LD) for SEO
 */
export function generateStructuredData(data: SEOData & {
  url?: string;
  logo?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed: string;
  };
  sameAs?: string[];
}): any {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': data.type === 'article' ? 'Article' : 'WebPage',
    name: data.title,
    headline: data.title,
    description: data.description,
    url: data.url || data.canonical,
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime || data.publishedTime,
  };

  if (data.image) {
    (baseSchema as any).image = {
      '@type': 'ImageObject',
      url: data.image,
      alt: data.title
    };
  }

  if (data.author) {
    (baseSchema as any).author = {
      '@type': 'Person',
      name: data.author
    };
  }

  // Organization schema for website
  if (data.type === 'website' && data.siteName) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.siteName,
      url: data.url,
      logo: data.logo,
      contactPoint: data.contactPoint,
      sameAs: data.sameAs
    };
  }

  return baseSchema;
}

/**
 * SEO audit function
 */
export function auditSEO(): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (typeof document === 'undefined') {
    return { score: 0, issues: ['Cannot audit SEO on server side'], recommendations: [] };
  }

  // Check title tag
  const title = document.querySelector('title');
  if (!title || !title.textContent?.trim()) {
    issues.push('Missing page title');
    score -= 20;
  } else if (title.textContent.length < 30 || title.textContent.length > 60) {
    issues.push(`Title length should be 30-60 characters (current: ${title.textContent.length})`);
    score -= 10;
    recommendations.push('Optimize title length for better search results');
  }

  // Check meta description
  const description = document.querySelector('meta[name="description"]');
  if (!description || !description.getAttribute('content')?.trim()) {
    issues.push('Missing meta description');
    score -= 15;
  } else {
    const content = description.getAttribute('content')!;
    if (content.length < 120 || content.length > 160) {
      issues.push(`Meta description should be 120-160 characters (current: ${content.length})`);
      score -= 8;
      recommendations.push('Optimize meta description length');
    }
  }

  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    issues.push('Missing canonical URL');
    score -= 10;
    recommendations.push('Add canonical URL to prevent duplicate content issues');
  }

  // Check Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');

  if (!ogTitle) {
    issues.push('Missing Open Graph title');
    score -= 5;
  }
  if (!ogDescription) {
    issues.push('Missing Open Graph description');
    score -= 5;
  }
  if (!ogImage) {
    issues.push('Missing Open Graph image');
    score -= 5;
    recommendations.push('Add Open Graph image for better social media sharing');
  }

  // Check for headings structure
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) {
    issues.push('Missing H1 tag');
    score -= 15;
  } else if (h1Tags.length > 1) {
    issues.push('Multiple H1 tags found');
    score -= 10;
    recommendations.push('Use only one H1 tag per page');
  }

  // Check for alt attributes on images
  const images = document.querySelectorAll('img');
  let missingAltCount = 0;
  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      missingAltCount++;
    }
  });

  if (missingAltCount > 0) {
    issues.push(`${missingAltCount} images missing alt attributes`);
    score -= Math.min(missingAltCount * 2, 15);
    recommendations.push('Add descriptive alt attributes to all images');
  }

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  let hierarchyIssues = false;

  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1 && previousLevel !== 0) {
      hierarchyIssues = true;
    }
    previousLevel = level;
  });

  if (hierarchyIssues) {
    issues.push('Improper heading hierarchy');
    score -= 8;
    recommendations.push('Maintain proper heading hierarchy (H1 → H2 → H3, etc.)');
  }

  // Check page load speed (basic check)
  if (typeof performance !== 'undefined') {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      if (loadTime > 3000) {
        issues.push('Slow page load time');
        score -= 15;
        recommendations.push('Optimize page load speed for better SEO rankings');
      }
    }
  }

  // Check for HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    issues.push('Not using HTTPS');
    score -= 20;
    recommendations.push('Enable HTTPS for security and SEO benefits');
  }

  // Check viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push('Missing viewport meta tag');
    score -= 10;
    recommendations.push('Add viewport meta tag for mobile optimization');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

/**
 * Generate sitemap XML
 */
export function generateSitemapXML(urls: Array<{
  url: string;
  lastModified?: string;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}>): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const urlElements = urls.map(item => `
  <url>
    <loc>${baseUrl}${item.url}</loc>
    ${item.lastModified ? `<lastmod>${item.lastModified}</lastmod>` : ''}
    ${item.changeFreq ? `<changefreq>${item.changeFreq}</changefreq>` : ''}
    ${item.priority ? `<priority>${item.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(config: {
  sitemap?: string;
  disallow?: string[];
  allow?: string[];
  crawlDelay?: number;
}): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  let content = 'User-agent: *\n';
  
  if (config.allow) {
    config.allow.forEach(path => {
      content += `Allow: ${path}\n`;
    });
  }
  
  if (config.disallow) {
    config.disallow.forEach(path => {
      content += `Disallow: ${path}\n`;
    });
  } else {
    content += 'Allow: /\n';
  }
  
  if (config.crawlDelay) {
    content += `Crawl-delay: ${config.crawlDelay}\n`;
  }
  
  if (config.sitemap) {
    content += `\nSitemap: ${baseUrl}${config.sitemap}\n`;
  }
  
  return content;
}

/**
 * SEO utilities for development
 */
export const seoUtils = {
  /**
   * Log SEO audit results
   */
  logAudit(): void {
    if (typeof window === 'undefined') return;
    
    const audit = auditSEO();
    console.group('🔍 SEO Audit');
    console.log(`Score: ${audit.score}/100`);
    
    if (audit.issues.length > 0) {
      console.group('Issues:');
      audit.issues.forEach(issue => console.warn('⚠️', issue));
      console.groupEnd();
    }
    
    if (audit.recommendations.length > 0) {
      console.group('Recommendations:');
      audit.recommendations.forEach(rec => console.info('💡', rec));
      console.groupEnd();
    }
    
    console.groupEnd();
  },

  /**
   * Preview how page appears in search results
   */
  previewSearchResult(): {
    title: string;
    url: string;
    description: string;
  } | null {
    if (typeof document === 'undefined') return null;

    const title = document.querySelector('title')?.textContent || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const url = window.location.href;

    return {
      title: title.length > 60 ? title.substring(0, 57) + '...' : title,
      url,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description
    };
  },

  /**
   * Get page insights for SEO
   */
  getPageInsights(): {
    wordCount: number;
    readingTime: number;
    headingStructure: { [key: string]: number };
    internalLinks: number;
    externalLinks: number;
  } | null {
    if (typeof document === 'undefined') return null;

    // Word count
    const textContent = document.body.textContent || '';
    const wordCount = textContent.trim().split(/\s+/).length;

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Heading structure
    const headingStructure: { [key: string]: number } = {};
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      headingStructure[tag] = document.querySelectorAll(tag).length;
    });

    // Link analysis
    const links = document.querySelectorAll('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        externalLinks++;
      } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        internalLinks++;
      }
    });

    return {
      wordCount,
      readingTime,
      headingStructure,
      internalLinks,
      externalLinks
    };
  }
};

// Initialize SEO monitoring in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      seoUtils.logAudit();
    }, 1000);
  });
}