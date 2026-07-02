/**
 * Security Configuration
 * 
 * Centralized security settings and utilities for production deployment
 */

export interface SecurityConfig {
  csp: ContentSecurityPolicy;
  headers: SecurityHeaders;
  validation: ValidationRules;
  rateLimit: RateLimitConfig;
}

export interface ContentSecurityPolicy {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  fontSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  frameSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  workerSrc: string[];
  childSrc: string[];
  formAction: string[];
  baseUri: string[];
  manifestSrc: string[];
}

export interface SecurityHeaders {
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

export interface ValidationRules {
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  maxStringLength: number;
  maxArrayLength: number;
  allowedDomains: string[];
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

/**
 * Builds the allowed domains list from environment configuration.
 * Falls back to 'localhost' in development.
 */
function buildAllowedDomains(): string[] {
  const domains: string[] = [
    'localhost',
    '*.firebase.googleapis.com',
    '*.googleapis.com'
  ];

  const appDomain = import.meta.env.VITE_APP_DOMAIN;
  if (appDomain && appDomain !== 'localhost') {
    domains.push(appDomain);
    domains.push(`www.${appDomain}`);
  }

  return domains;
}

/**
 * Production security configuration
 */
export const productionSecurityConfig: SecurityConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebase.googleapis.com",
      "https://*.gstatic.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for component styles
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "data:"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://*.firebase.googleapis.com",
      "https://*.googleusercontent.com"
    ],
    connectSrc: [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebase.googleapis.com",
      "wss://*.firebase.googleapis.com",
      "https://*.cloudfunctions.net"
    ],
    frameSrc: [
      "'self'",
      "https://*.firebase.googleapis.com"
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'"],
    childSrc: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    manifestSrc: ["'self'"]
  },

  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    // '0' disables the legacy XSS auditor — the filter is deprecated and its
    // filtering mode enabled side-channel attacks; CSP is the real defense.
    'X-XSS-Protection': '0',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },

  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxStringLength: 10000,
    maxArrayLength: 1000,
    allowedDomains: buildAllowedDomains()
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

/**
 * Development security configuration (more permissive)
 */
export const developmentSecurityConfig: SecurityConfig = {
  ...productionSecurityConfig,
  csp: {
    ...productionSecurityConfig.csp,
    scriptSrc: [
      ...productionSecurityConfig.csp.scriptSrc,
      "'unsafe-eval'",
      "localhost:*",
      "127.0.0.1:*"
    ],
    connectSrc: [
      ...productionSecurityConfig.csp.connectSrc,
      "localhost:*",
      "127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*"
    ]
  },
  rateLimit: {
    ...productionSecurityConfig.rateLimit,
    maxRequests: 1000 // More lenient for development
  }
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig(): SecurityConfig {
  const isDev = import.meta.env.DEV;
  return isDev ? developmentSecurityConfig : productionSecurityConfig;
}

/**
 * Generate CSP header string from configuration
 */
export function generateCSPHeader(csp: ContentSecurityPolicy): string {
  const directives = Object.entries(csp)
    .map(([key, values]) => {
      // Convert camelCase to kebab-case
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${directive} ${values.join(' ')}`;
    });
  
  return directives.join('; ');
}

/**
 * Validate file upload based on security rules
 */
export function validateFileUpload(file: File, rules: ValidationRules): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check file size
  if (file.size > rules.maxFileSize) {
    errors.push(`File size exceeds maximum allowed size of ${rules.maxFileSize / 1024 / 1024}MB`);
  }

  // Check file type
  if (!rules.allowedFileTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file name for path traversal and dangerous characters
  if (file.name.includes('../') || file.name.includes('..\\')) {
    errors.push('File name contains invalid path traversal characters');
  }
  if (/[\x00-\x1f]/.test(file.name)) {
    errors.push('File name contains invalid control characters');
  }
  if (/[<>:"|?*]/.test(file.name)) {
    errors.push('File name contains reserved characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate string input
 */
export function validateStringInput(input: string, maxLength: number = 1000): {
  valid: boolean;
  error?: string;
} {
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`
    };
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Input contains potentially dangerous content'
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') {
    // SSR/prerender: fall back to manual entity escaping
    return clientSecurityUtils.escapeHtml(html);
  }
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Generate secure random string with full cryptographic entropy
 * Uses base64url encoding for maximum entropy and URL safety
 */
export function generateSecureToken(length: number = 32): string {
  // Generate random bytes
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Convert to base64url (URL-safe base64 without padding)
  const base64 = btoa(String.fromCharCode(...array));

  // Make URL-safe by replacing + with - and / with _
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return base64url;
}

/**
 * Check if URL is from allowed domain
 */
export function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    return allowedDomains.some(domain => {
      if (domain.startsWith('*.')) {
        const baseDomain = domain.slice(2);
        return hostname === baseDomain || hostname.endsWith('.' + baseDomain);
      }
      return hostname === domain;
    });
  } catch {
    return false;
  }
}

/**
 * Security middleware for API requests
 */
export function createSecurityMiddleware(config: SecurityConfig) {
  return {
    validateRequest: (request: Request) => {
      const errors: string[] = [];

      // Validate Content-Type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          errors.push('Invalid Content-Type header');
        }
      }

      // Validate Origin header
      const origin = request.headers.get('origin');
      if (origin && !isAllowedDomain(origin, config.validation.allowedDomains)) {
        errors.push('Invalid Origin header');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    addSecurityHeaders: (response: Response) => {
      const headers = new Headers(response.headers);
      
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });

      headers.set('Content-Security-Policy', generateCSPHeader(config.csp));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
  };
}

/**
 * Client-side security utilities
 */
export const clientSecurityUtils = {
  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml: (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Generate CSP nonce for inline scripts
   */
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  /**
   * Check if current context is secure (HTTPS)
   */
  isSecureContext: (): boolean => {
    return window.isSecureContext;
  },

  /**
   * Validate and sanitize user input
   */
  sanitizeInput: (input: string, maxLength?: number): string => {
    const validation = validateStringInput(input, maxLength);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return sanitizeHtml(input);
  }
};