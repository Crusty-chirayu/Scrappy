
export interface SSRFValidationResult {
  valid: boolean;
  sanitizedUrl?: string;
  reason?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "instance-data",
]);

/**
 * Checks whether an IPv4 address is in a reserved/private CIDR block:
 * - 10.0.0.0/8
 * - 172.16.0.0/12
 * - 192.168.0.0/16
 * - 127.0.0.0/8
 * - 169.254.0.0/16 (link-local, cloud metadata)
 * - 0.0.0.0/8
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const a = parts[0];
  const b = parts[1];
  if (a === undefined || b === undefined) return false;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;

  return false;
}

/**
 * Validates a user-supplied target URL against SSRF attacks.
 * Only HTTP and HTTPS protocols are permitted. Private IPs, cloud metadata endpoints,
 * and localhost origins are rejected.
 */
export function validateTargetUrl(rawUrl: string): SSRFValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, reason: "URL must be a non-empty string" };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, reason: "Malformed URL" };
  }

  // Protocol check: strictly http: or https:
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      reason: `Disallowed protocol: '${parsed.protocol}'. Only http: and https: are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Strip enclosing brackets for IPv6 if present
  const normalizedHost = hostname.replace(/^\[|\]$/g, "");

  // Hostname blocklist
  if (BLOCKED_HOSTNAMES.has(normalizedHost)) {
    return { valid: false, reason: `Target host '${hostname}' is restricted` };
  }

  // TLD / suffix check
  if (
    normalizedHost.endsWith(".localhost") ||
    normalizedHost.endsWith(".local") ||
    normalizedHost.endsWith(".internal") ||
    normalizedHost.endsWith(".lan")
  ) {
    return { valid: false, reason: `Internal domain '${hostname}' is not permitted` };
  }

  // Check IPv4 private ranges
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalizedHost)) {
    if (isPrivateIPv4(normalizedHost)) {
      return { valid: false, reason: `Private IP address '${normalizedHost}' is blocked` };
    }
  }

  // Check IPv6 loopback / private
  if (
    normalizedHost === "::1" ||
    normalizedHost.startsWith("fc00:") ||
    normalizedHost.startsWith("fe80:")
  ) {
    return { valid: false, reason: `Private IPv6 address '${normalizedHost}' is blocked` };
  }

  return {
    valid: true,
    sanitizedUrl: parsed.toString(),
  };
}
