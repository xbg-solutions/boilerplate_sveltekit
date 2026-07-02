/**
 * src/lib/utils/redirect.ts
 * Safe redirect-target validation
 *
 * Any redirect target that originates from a URL parameter (returnUrl,
 * redirect, next, …) must pass through safeRedirectUrl() before being
 * navigated to, otherwise a crafted link can bounce a signed-in user to an
 * attacker-controlled destination (open redirect / phishing).
 */

/**
 * Validate that a redirect URL is a safe relative path within this app.
 * Rejects absolute URLs, protocol-relative URLs (//evil.com), scheme
 * injection (javascript:, https://…) and backslash tricks (/\evil.com).
 *
 * @param url Candidate redirect target (typically from a query parameter)
 * @param fallback Path to use when the candidate is missing or unsafe
 */
export function safeRedirectUrl(url: string | null | undefined, fallback: string = '/'): string {
  if (!url) return fallback;
  if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return fallback;
  if (url.includes('://') || url.includes('\\')) return fallback;
  return url;
}
