/**
 * Performance monitoring utilities
 */

// Performance metrics tracking
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Web Vitals observer
    if ('PerformanceObserver' in window) {
      const vitalsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(`web-vital-${entry.name}`, (entry as any).value || 0);
        }
      });

      try {
        vitalsObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        vitalsObserver.observe({ type: 'first-input', buffered: true });
        vitalsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(vitalsObserver);
      } catch (e) {
        console.warn('Some performance observers not supported:', e);
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  /**
   * Get metrics summary
   */
  getMetrics(name?: string) {
    if (name) {
      const values = this.metrics.get(name) || [];
      return {
        name,
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
        values
      };
    }

    const summary: Record<string, any> = {};
    for (const [metricName] of this.metrics) {
      summary[metricName] = this.getMetrics(metricName);
    }
    return summary;
  }

  /**
   * Measure function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    this.recordMetric(name, end - start);
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    this.recordMetric(name, end - start);
    return result;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy loading utility for images
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll(selector).forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Critical resource preloader
 */
export function preloadResource(href: string, as: string = 'fetch') {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Bundle analyzer data collector
 */
export function getBundleAnalytics() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return {
    pageLoad: {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
    },
    resources: {
      scripts: resources.filter(r => r.initiatorType === 'script').length,
      stylesheets: resources.filter(r => r.initiatorType === 'css').length,
      images: resources.filter(r => r.initiatorType === 'img').length,
      total: resources.length
    },
    timing: {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
    }
  };
}

/**
 * Web Vitals monitoring
 */
export interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function getWebVitals(): Promise<WebVital[]> {
  return new Promise((resolve) => {
    const vitals: WebVital[] = [];
    
    if (typeof window === 'undefined') {
      resolve(vitals);
      return;
    }

    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          const value = lastEntry.startTime;
          vitals.push({
            name: 'LCP',
            value: Math.round(value),
            rating: value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.debug('LCP not supported');
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const value = entry.processingStart - entry.startTime;
          vitals.push({
            name: 'FID',
            value: Math.round(value),
            rating: value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.debug('FID not supported');
    }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.push({
          name: 'CLS',
          value: Math.round(clsValue * 1000) / 1000,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.debug('CLS not supported');
    }

    // Return vitals after 2 seconds
    setTimeout(() => resolve(vitals), 2000);
  });
}

/**
 * Performance audit for production readiness
 */
export async function performanceAudit(): Promise<{
  score: number;
  vitals: WebVital[];
  recommendations: string[];
  metrics: any;
}> {
  const vitals = await getWebVitals();
  const metrics = getBundleAnalytics();
  const recommendations: string[] = [];
  let score = 100;

  // Check Web Vitals
  vitals.forEach(vital => {
    if (vital.rating === 'poor') {
      score -= 30;
      recommendations.push(`Improve ${vital.name}: ${vital.value}ms is in poor range`);
    } else if (vital.rating === 'needs-improvement') {
      score -= 15;
      recommendations.push(`Optimize ${vital.name}: ${vital.value}ms needs improvement`);
    }
  });

  // Check bundle size
  if (metrics) {
    const { resources } = metrics;
    if (resources.scripts > 10) {
      score -= 10;
      recommendations.push('Consider reducing number of JavaScript files');
    }
    if (resources.stylesheets > 5) {
      score -= 5;
      recommendations.push('Consider consolidating CSS files');
    }
  }

  return {
    score: Math.max(0, score),
    vitals,
    recommendations,
    metrics
  };
}

// Initialize performance monitoring in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(async () => {
      const audit = await performanceAudit();
      console.group('🚀 Performance Audit');
      console.log(`Score: ${audit.score}/100`);
      console.log('Web Vitals:', audit.vitals);
      if (audit.recommendations.length > 0) {
        console.log('Recommendations:', audit.recommendations);
      }
      console.groupEnd();
    }, 2000);
  });
}