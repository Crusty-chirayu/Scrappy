import { SecuritySSRFError } from "@scrappy/core";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // AWS/GCP/Azure instance metadata
  "metadata.google.internal",
]);

/**
 * Validates user-supplied URLs to prevent Server-Side Request Forgery (SSRF).
 * Blocks internal IP ranges, metadata endpoints, and non-http(s) schemes.
 */
export function validateSafeUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SecuritySSRFError(rawUrl, "Malformed URL format");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SecuritySSRFError(rawUrl, `Disallowed protocol '${parsed.protocol}'`);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new SecuritySSRFError(rawUrl, `Access to blocked host '${hostname}' is prohibited`);
  }

  // Check IPv4 private ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x, 127.x.x.x, 169.254.x.x)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match && ipv4Match[1] && ipv4Match[2]) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);

    if (
      octet1 === 10 ||
      octet1 === 127 ||
      (octet1 === 192 && octet2 === 168) ||
      (octet1 === 172 && octet2 >= 16 && octet2 <= 31) ||
      (octet1 === 169 && octet2 === 254)
    ) {
      throw new SecuritySSRFError(rawUrl, `Access to private IP range '${hostname}' is prohibited`);
    }
  }

  return parsed;
}
