/**
 * Error Reporting Service
 * 
 * Centralized error collection and reporting for production monitoring
 */

import { browser } from '$app/environment';
import { loggerService } from '../logging/logging.service';
import type { User } from 'firebase/auth';

export interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  context?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  userEmail?: string | null;
  level: 'page' | 'component' | 'global';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
  breadcrumbs?: ErrorBreadcrumb[];
  environment: string;
  version: string;
}

export interface ErrorBreadcrumb {
  timestamp: number;
  message: string;
  category: 'navigation' | 'user' | 'api' | 'console' | 'dom';
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

class ErrorReportingService {
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private user: User | null = null;
  private tags: Record<string, string> = {};
  private isEnabled = false;
  private reportingEndpoint = '';

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!browser) return;

    // Initialize from environment variables
    this.reportingEndpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT || '';
    this.isEnabled = import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true';

    // Add navigation breadcrumbs
    this.addNavigationBreadcrumbs();
    
    // Add console breadcrumbs
    this.addConsoleBreadcrumbs();
    
    // Add DOM event breadcrumbs
    this.addDOMBreadcrumbs();
  }

  /**
   * Configure the error reporting service
   */
  configure(config: {
    endpoint?: string;
    enabled?: boolean;
    user?: User | null;
    tags?: Record<string, string>;
  }) {
    if (config.endpoint) this.reportingEndpoint = config.endpoint;
    if (typeof config.enabled === 'boolean') this.isEnabled = config.enabled;
    if (config.user !== undefined) this.user = config.user;
    if (config.tags) this.tags = { ...this.tags, ...config.tags };
  }

  /**
   * Report an error
   */
  async reportError(error: Error, context?: {
    errorId?: string;
    level?: 'page' | 'component' | 'global';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    tags?: Record<string, string>;
    url?: string;
  }): Promise<boolean> {
    if (!this.isEnabled || !browser) {
      loggerService.debug('Error reporting disabled or not in browser');
      return false;
    }

    try {
      const report = this.buildErrorReport(error, context);

      // Log locally first
      loggerService.error('Error reported', undefined, { errorId: report.errorId });

      // Send to reporting service
      if (this.reportingEndpoint) {
        await this.sendToReportingService(report);
      }

      // Store locally for offline support
      this.storeLocalReport(report);

      return true;
    } catch (reportError) {
      loggerService.error('Failed to report error', reportError as Error, {
        originalError: error.message
      });
      return false;
    }
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now()
    });

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }

  /**
   * Get current breadcrumbs
   */
  getBreadcrumbs(): ErrorBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  private buildErrorReport(error: Error, context?: {
    errorId?: string;
    level?: 'page' | 'component' | 'global';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    tags?: Record<string, string>;
    url?: string;
  }): ErrorReport {
    const timestamp = Date.now();
    
    return {
      errorId: context?.errorId || this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      timestamp,
      url: context?.url || (browser ? window.location.href : ''),
      userAgent: browser ? navigator.userAgent : 'SSR',
      userId: this.user?.uid,
      userEmail: this.user?.email,
      level: context?.level || 'component',
      severity: context?.severity || this.determineSeverity(error),
      tags: { ...this.tags, ...context?.tags },
      breadcrumbs: this.getBreadcrumbs(),
      environment: import.meta.env.MODE || 'production',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    };
  }

  private async sendToReportingService(report: ErrorReport): Promise<void> {
    const response = await fetch(this.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error(`Error reporting failed: ${response.status}`);
    }

    loggerService.debug('Error report sent successfully', { errorId: report.errorId });
  }

  private storeLocalReport(report: ErrorReport): void {
    try {
      const existingReports = JSON.parse(
        localStorage.getItem('error-reports') || '[]'
      );
      
      existingReports.push(report);
      
      // Keep only last 10 reports
      const recentReports = existingReports.slice(-10);
      
      localStorage.setItem('error-reports', JSON.stringify(recentReports));
    } catch (err) {
      loggerService.debug('Failed to store error report locally', { error: err });
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'low';
    }
    
    if (message.includes('auth') || message.includes('permission')) {
      return 'high';
    }
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    
    return 'medium';
  }

  private addNavigationBreadcrumbs() {
    if (!browser) return;
    
    // Track page navigation
    let currentUrl = window.location.href;
    
    const checkNavigation = () => {
      if (window.location.href !== currentUrl) {
        this.addBreadcrumb({
          message: `Navigation: ${currentUrl} → ${window.location.href}`,
          category: 'navigation',
          level: 'info',
          data: { from: currentUrl, to: window.location.href }
        });
        currentUrl = window.location.href;
      }
    };

    // Check for navigation changes
    setInterval(checkNavigation, 1000);
    
    // Track history changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      checkNavigation();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      checkNavigation();
    };
    
    window.addEventListener('popstate', checkNavigation);
  }

  private addConsoleBreadcrumbs() {
    if (!browser) return;
    
    const levels: ('error' | 'warn' | 'info')[] = ['error', 'warn', 'info'];
    
    levels.forEach(level => {
      const original = console[level];
      console[level] = (...args) => {
        this.addBreadcrumb({
          message: `Console ${level}: ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')}`,
          category: 'console',
          level: level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info',
          data: { args }
        });
        
        original.apply(console, args);
      };
    });
  }

  private addDOMBreadcrumbs() {
    if (!browser) return;
    
    // Track clicks on buttons and links
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.addBreadcrumb({
          message: `Click: ${target.tagName} "${target.textContent?.slice(0, 50) || ''}"`,
          category: 'user',
          level: 'info',
          data: {
            tagName: target.tagName,
            className: target.className,
            href: (target as HTMLAnchorElement).href,
            type: (target as HTMLButtonElement).type
          }
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.addBreadcrumb({
        message: `Form submit: ${form.action || 'current page'}`,
        category: 'user',
        level: 'info',
        data: {
          action: form.action,
          method: form.method,
          formId: form.id
        }
      });
    });
  }

  /**
   * Get stored local reports
   */
  getLocalReports(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('error-reports') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored local reports
   */
  clearLocalReports(): void {
    localStorage.removeItem('error-reports');
  }
}

export const errorReportingService = new ErrorReportingService();