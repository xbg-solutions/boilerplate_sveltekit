/**
 * src/hooks.server.ts
 * SvelteKit Server Hooks
 *
 * Applies security headers and middleware to all server responses.
 * This provides defense-in-depth alongside Firebase Hosting headers.
 */

import type { Handle } from '@sveltejs/kit';
import { getSecurityConfig, generateCSPHeader } from '$lib/config/security';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * Security headers hook
 * Applies comprehensive security headers to all responses
 */
const securityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  const securityConfig = getSecurityConfig();

  // Apply security headers
  const headers = new Headers(response.headers);

  // Basic security headers
  headers.set('X-Frame-Options', securityConfig.headers['X-Frame-Options']);
  headers.set('X-Content-Type-Options', securityConfig.headers['X-Content-Type-Options']);
  headers.set('X-XSS-Protection', securityConfig.headers['X-XSS-Protection']);
  headers.set('Referrer-Policy', securityConfig.headers['Referrer-Policy']);
  headers.set('Permissions-Policy', securityConfig.headers['Permissions-Policy']);

  // HSTS only in production and over HTTPS
  if (import.meta.env.PROD && event.url.protocol === 'https:') {
    headers.set('Strict-Transport-Security', securityConfig.headers['Strict-Transport-Security']);
  }

  // Content Security Policy
  const cspHeader = generateCSPHeader(securityConfig.csp);
  headers.set('Content-Security-Policy', cspHeader);

  // Additional security headers
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

/**
 * Request validation hook
 * Validates incoming requests for security issues
 */
const requestValidation: Handle = async ({ event, resolve }) => {
  const { request } = event;

  // Validate Content-Type for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const contentType = request.headers.get('content-type');

    // Allow FormData, JSON, or no body
    if (contentType &&
        !contentType.includes('application/json') &&
        !contentType.includes('multipart/form-data') &&
        !contentType.includes('application/x-www-form-urlencoded')) {
      return new Response('Invalid Content-Type', { status: 415 });
    }
  }

  // Check for suspicious patterns in URL
  const url = event.url.pathname;
  if (url.includes('../') || url.includes('..\\') || url.includes('%2e%2e')) {
    return new Response('Invalid URL', { status: 400 });
  }

  return resolve(event);
};

/**
 * CORS configuration hook
 * Configurable CORS handling for API routes
 */
const corsHeaders: Handle = async ({ event, resolve }) => {
  // Only apply CORS to API routes
  if (event.url.pathname.startsWith('/api')) {
    // Handle preflight requests
    if (event.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Origin': getAllowedOrigin(event.request.headers.get('origin')),
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
        }
      });
    }
  }

  const response = await resolve(event);

  // Add CORS headers to API responses
  if (event.url.pathname.startsWith('/api')) {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', getAllowedOrigin(event.request.headers.get('origin')));
    headers.set('Access-Control-Allow-Credentials', 'true');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return response;
};

/**
 * Get allowed origin for CORS
 * Returns the origin if it's in the allowlist, otherwise returns restrictive default
 */
function getAllowedOrigin(origin: string | null): string {
  if (!origin) return 'null';

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
  ];

  // Add production domain from environment
  const appDomain = import.meta.env.VITE_APP_DOMAIN;
  if (appDomain && appDomain !== 'localhost') {
    allowedOrigins.push(`https://${appDomain}`);
    allowedOrigins.push(`https://www.${appDomain}`);
  }

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  // For production, return the configured domain or restrictive default
  if (import.meta.env.PROD && appDomain) {
    return `https://${appDomain}`;
  }

  return 'null';
}

/**
 * Rate limiting hook (client-side tracking)
 * Note: This is a basic implementation. For production, implement server-side rate limiting
 * in your API backend (Firebase Cloud Functions, etc.)
 */
const rateLimiting: Handle = async ({ event, resolve }) => {
  // For state-changing operations, add rate limit headers (informational)
  const response = await resolve(event);

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method)) {
    const headers = new Headers(response.headers);

    // Add rate limit headers (these are informational - actual limiting should be server-side)
    const securityConfig = getSecurityConfig();
    headers.set('X-RateLimit-Limit', securityConfig.rateLimit.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', '99'); // Placeholder - implement actual tracking
    headers.set('X-RateLimit-Reset', new Date(Date.now() + securityConfig.rateLimit.windowMs).toISOString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return response;
};

/**
 * Combine all hooks in sequence
 * Order matters: validation -> CORS -> rate limiting -> security headers
 */
export const handle = sequence(
  requestValidation,
  corsHeaders,
  rateLimiting,
  securityHeaders
);
