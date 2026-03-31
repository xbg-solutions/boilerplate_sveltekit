/**
 * src/lib/utils/sanitizer.ts
 * Sanitizer utility
 * 
 * A utility for sanitizing user inputs and other data with support for:
 * - Multiple sanitization levels (strict, medium, basic)
 * - XSS prevention and HTML sanitization
 * - Recursive sanitization of complex objects
 * - Type-safe implementation
 * - Integration with error handling
 */

import {
  loggerService,
  ApplicationError,
  handleError,
  normalizeError,
  tryCatch
} from '@xbg.solutions/bpsk-core';
import type { 
  SanitizerOptions, 
  SanitizationLevel, 
  RecursivelyProcessed
} from '../types/sanitizer.types';

// Create a context-aware logger
const sanitizerLogger = loggerService.withContext('Sanitizer');

/**
 * List of allowed HTML tags for medium level sanitization
 * Customize this list based on your application's requirements
 */
const ALLOWED_TAGS = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'strong', 'em', 'b', 'i', 'u', 'a', 'span'
];

/**
 * List of allowed HTML attributes for medium level sanitization
 * Customize this list based on your application's requirements
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'target', 'rel', 'title'],
  'span': ['class'],
  'code': ['class'],
  '*': ['id', 'class'] // Allowed on all elements
};

/**
 * Sanitizes HTML strings by escaping special characters
 * 
 * @param input String to sanitize
 * @returns Sanitized string with HTML entities escaped
 */
function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes a string by stripping all HTML tags
 * 
 * @param input String to sanitize
 * @returns String with all HTML tags removed
 */
function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Use regex to remove all HTML tags
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a string by allowing only specified HTML tags
 * 
 * @param input String to sanitize
 * @returns String with only allowed HTML tags
 */
function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // For server-side or environments without DOMParser
  if (typeof DOMParser === 'undefined') {
    // Fallback to regex-based sanitization
    let result = input;
    
    // Remove disallowed tags - simplified approach
    const allowedTagPattern = ALLOWED_TAGS.join('|');
    const tagPattern = new RegExp(`<(?!\/?(?:${allowedTagPattern})\\b)[^>]+>`, 'gi');
    result = result.replace(tagPattern, '');
    
    return result;
  }
  
  // This is a simplified implementation
  // In production, consider using libraries like DOMPurify
  
  try {
    // Create a temporary DOM element
    const doc = new DOMParser().parseFromString(input, 'text/html');
    
    // Walk through all elements and remove disallowed ones
    const sanitizeNode = (node: Node): void => {
      // Create a copy of childNodes to iterate over since we'll be modifying the collection
      const childNodes = Array.from(node.childNodes);
      
      for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const element = child as Element;
          const tagName = element.tagName.toLowerCase();
          
          // Remove element if not in allowed tags
          if (!ALLOWED_TAGS.includes(tagName)) {
            node.removeChild(child);
            continue;
          }
          
          // Remove disallowed attributes
          Array.from(element.attributes).forEach(attr => {
            const attributeName = attr.name;
            const isAllowed = 
              (ALLOWED_ATTRIBUTES[tagName] && ALLOWED_ATTRIBUTES[tagName].includes(attributeName)) ||
              (ALLOWED_ATTRIBUTES['*'] && ALLOWED_ATTRIBUTES['*'].includes(attributeName));
            
            if (!isAllowed) {
              element.removeAttribute(attributeName);
            }
          });
          
          // Sanitize URLs in href attributes to prevent javascript: protocol
          if (tagName === 'a' && element.hasAttribute('href')) {
            const href = element.getAttribute('href') || '';
            if (href.match(/^\s*javascript:/i)) {
              element.setAttribute('href', '#');
            }
            
            // Add safety attributes to external links
            if (href.match(/^https?:\/\//i) && !href.match(new RegExp(`^https?://${window.location.hostname}`, 'i'))) {
              element.setAttribute('rel', 'noopener noreferrer');
              element.setAttribute('target', '_blank');
            }
          }
          
          // Recursively sanitize child nodes
          sanitizeNode(child);
        }
      }
    };
    
    // Start sanitizing from the body
    sanitizeNode(doc.body);
    
    // Use innerHTML to get the complete sanitized HTML
    // The reason we're using this approach is DOMParser might not return the complete HTML
    // For example, it might omit closing tags or normalize tag structure
    const result = doc.body.innerHTML;
    
    // Ensure complete tags by adding a temporary wrapper and using innerHTML
    // This technique helps create well-formed HTML
    if (result) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = result;
      return wrapper.innerHTML;
    }
    
    return doc.body.innerHTML;
  } catch (error) {
    sanitizerLogger.error('HTML sanitization failed', error instanceof Error ? error : new Error(String(error)), {
      inputLength: input.length
    });
    
    // Fallback to stripping all HTML
    return stripHtml(input);
  }
}

/**
 * Sanitizes input based on the specified level
 * 
 * @param input Input to sanitize
 * @param level Sanitization level
 * @returns Sanitized input based on level
 */
function sanitizeByLevel(input: string, level: SanitizationLevel): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  switch(level) {
    case 'strict':
      return stripHtml(input).trim();
    case 'medium':
      return sanitizeHtml(input);
    case 'basic':
    default:
      return escapeHtml(input);
  }
}

/**
 * Sanitizes strings, objects, or arrays according to sanitization options
 * 
 * @param input Input to sanitize
 * @param options Sanitization options
 * @returns Sanitized output
 */
function sanitizeInput<T>(input: T, options: SanitizerOptions = {}): RecursivelyProcessed<T> {
  // Default options
  const {
    level = 'basic',
    preserveCase = true,
    preserveWhitespace = true,
    maxLength
  } = options;
  
  // Handle null or undefined
  if (input === null || input === undefined) {
    return input as RecursivelyProcessed<T>;
  }
  
  // Handle strings
  if (typeof input === 'string') {
    let result = input as string;
    
    // Apply sanitization based on level
    const sanitized = sanitizeByLevel(result, level);
    
    // Apply other transformations
    let processed = sanitized;
    if (!preserveCase) {
      processed = processed.toLowerCase();
    }
    
    if (!preserveWhitespace) {
      processed = processed.trim().replace(/\s+/g, ' ');
    }
    
    // Apply maximum length if specified
    if (maxLength && maxLength > 0 && processed.length > maxLength) {
      processed = processed.substring(0, maxLength);
    }
    
    return processed as unknown as RecursivelyProcessed<T>;
  }
  
  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item, options)) as RecursivelyProcessed<T>;
  }
  
  // Handle objects
  if (typeof input === 'object') {
    const result: Record<string, any> = {};
    
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = sanitizeInput((input as Record<string, any>)[key], options);
      }
    }
    
    return result as RecursivelyProcessed<T>;
  }
  
  // Return other types unchanged
  return input as RecursivelyProcessed<T>;
}

/**
 * Main sanitizer function
 * 
 * @param input Input to sanitize
 * @param options Sanitization options
 * @returns Sanitized output
 */
function sanitize<T>(input: T, options: SanitizerOptions = {}): RecursivelyProcessed<T> {
  try {
    return sanitizeInput(input, options);
  } catch (error) {
    const normalizedError = normalizeError(error, 'Sanitization failed', {
      category: 'sanitizer',
      context: { options }
    });
    
    sanitizerLogger.error(
      'Failed to sanitize input', 
      normalizedError
    );
    
    // For errors, return empty string for strings or empty objects/arrays
    if (typeof input === 'string') {
      return '' as RecursivelyProcessed<T>;
    } else if (Array.isArray(input)) {
      return [] as RecursivelyProcessed<T>;
    } else if (typeof input === 'object' && input !== null) {
      return {} as RecursivelyProcessed<T>;
    }
    
    return undefined as any;
  }
}

/**
 * Safely sanitizes input and handles errors
 * 
 * @param input Input to sanitize
 * @param options Sanitization options
 * @returns Sanitized output or original input if sanitization fails
 */
async function safeSanitize<T>(
  input: T, 
  options: SanitizerOptions = {}
): Promise<RecursivelyProcessed<T>> {
  return tryCatch(
    async () => sanitize(input, options),
    () => input as RecursivelyProcessed<T>
  ) as Promise<RecursivelyProcessed<T>>;
}

/**
 * Creates a sanitizer function with predefined options
 * 
 * @param defaultOptions Default sanitization options
 * @returns Sanitizer function with default options applied
 */
function createSanitizer(defaultOptions: SanitizerOptions = {}) {
  return <T>(input: T, options: SanitizerOptions = {}): RecursivelyProcessed<T> => {
    // Merge default options with provided options
    const mergedOptions = {
      ...defaultOptions,
      ...options
    };
    
    return sanitize(input, mergedOptions);
  };
}

// Predefined sanitizers for common use cases
const strictSanitizer = createSanitizer({ level: 'strict' });
const mediumSanitizer = createSanitizer({ level: 'medium' });
const basicSanitizer = createSanitizer({ level: 'basic' });

// For form input sanitization
const inputSanitizer = createSanitizer({ 
  level: 'strict',
  preserveWhitespace: false
});

// For URL parameters
const urlParamSanitizer = createSanitizer({
  level: 'strict',
  preserveCase: true,
  preserveWhitespace: false,
  maxLength: 255
});

// Export the sanitizer functions
export {
  sanitize,
  safeSanitize,
  createSanitizer,
  strictSanitizer,
  mediumSanitizer,
  basicSanitizer,
  inputSanitizer,
  urlParamSanitizer,
  escapeHtml,
  stripHtml,
  sanitizeHtml
};