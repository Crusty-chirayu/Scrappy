/**
 * HTML Sanitizer for SCRAPPY
 * Neutralizes XSS attack vectors in scraped HTML content, product titles, descriptions,
 * and user-supplied extractor parameters.
 */

const DANGEROUS_BLOCKS_REGEX = /<(script|style|iframe|object|embed|applet|noscript)[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_TAGS_REGEX = /<\/?(script|iframe|object|embed|style|link|base|meta|form|svg|math|applet|noscript)[^>]*>/gi;
const INLINE_EVENT_HANDLER_REGEX = /\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /(href|src|action)\s*=\s*(['"]?)\s*(javascript:|vbscript:|data:text\/html)/gi;

/**
 * Sanitizes scraped HTML markup by stripping executable script tags, iframe embeds,
 * inline JavaScript event handlers (e.g. onerror=, onload=), and dangerous protocol schemes.
 */
export function sanitizeScrapedHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let sanitized = html;

  // 1. Remove dangerous blocks completely (including enclosed executable JavaScript / styles)
  sanitized = sanitized.replace(DANGEROUS_BLOCKS_REGEX, "");

  // 2. Remove any remaining dangerous tags (unclosed or self-closing)
  sanitized = sanitized.replace(DANGEROUS_TAGS_REGEX, "");

  // 2. Remove all inline event handlers (e.g. <img src=x onerror=alert(1)> -> <img src=x>)
  sanitized = sanitized.replace(INLINE_EVENT_HANDLER_REGEX, "");

  // 3. Neutralize javascript:, vbscript:, and data:text/html in href/src attributes
  sanitized = sanitized.replace(JAVASCRIPT_PROTOCOL_REGEX, '$1=$2about:blank#blocked-protocol');

  return sanitized;
}

/**
 * Encodes special characters in plain text fields to prevent HTML injection.
 */
export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
