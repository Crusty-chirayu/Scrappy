import { SecuritySSRFError } from "@scrappy/core";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "::ffff:127.0.0.1",
  "169.254.169.254", // AWS/GCP/Azure/OpenStack metadata
  "metadata.google.internal",
  "instance-data",
]);

/**
 * Checks whether an IP address belongs to a private, loopback, link-local,
 * multicast, or reserved subnet.
 */
export function isPrivateOrBlockedIp(ip: string): boolean {
  const cleanIp = ip.trim().toLowerCase();

  // IPv6 mapped IPv4 (e.g. ::ffff:127.0.0.1)
  if (cleanIp.startsWith("::ffff:")) {
    const v4Part = cleanIp.substring(7);
    return isPrivateOrBlockedIp(v4Part);
  }

  // IPv6 loopback & private subnets (fc00::/7 ULA, fe80::/10 link-local, ::1 loopback)
  if (
    cleanIp === "::1" ||
    cleanIp === "::" ||
    /^f[cd][0-9a-f]{2}:/i.test(cleanIp) ||
    /^fe[89ab][0-9a-f]:/i.test(cleanIp)
  ) {
    return true;
  }

  // Parse IPv4
  const ipv4Parts = cleanIp.split(".");
  if (ipv4Parts.length === 4) {
    const octets = ipv4Parts.map((p) => parseInt(p, 10));
    if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
      return true; // invalid -> block
    }

    const [o1, o2] = octets as [number, number, number, number];

    // 0.0.0.0/8 (current network)
    if (o1 === 0) return true;
    // 10.0.0.0/8 (private)
    if (o1 === 10) return true;
    // 127.0.0.0/8 (loopback)
    if (o1 === 127) return true;
    // 169.254.0.0/16 (link-local / cloud metadata)
    if (o1 === 169 && o2 === 254) return true;
    // 172.16.0.0/12 (private: 172.16.0.0 - 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.168.0.0/16 (private)
    if (o1 === 192 && o2 === 168) return true;
    // 100.64.0.0/10 (carrier-grade NAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    // 198.18.0.0/15 (benchmark tests)
    if (o1 === 198 && (o2 === 18 || o2 === 19)) return true;
    // 224.0.0.0/4 (multicast)
    if (o1 >= 224 && o1 <= 239) return true;
    // 240.0.0.0/4 (reserved)
    if (o1 >= 240) return true;

    return false;
  }

  return false;
}

/**
 * Checks for numeric / decimal / hex IP representations that bypass naive regexes.
 * e.g. 2130706433 (127.0.0.1 in decimal) or 0x7f000001
 */
function isNumericObfuscatedIp(hostname: string): boolean {
  // Pure decimal integer (e.g. 2130706433 or 2852039166)
  if (/^\d+$/.test(hostname)) {
    return true;
  }
  // Hex notation (e.g. 0x7f.0.0.1 or 0x7f000001)
  if (/^0x[0-9a-f]+$/i.test(hostname) || /0x[0-9a-f]/i.test(hostname)) {
    return true;
  }
  // Octal notation (e.g. 0177.0.0.1)
  if (/\b0[0-7]{2,}\b/.test(hostname)) {
    return true;
  }
  return false;
}

/**
 * Synchronous URL validation: checks protocol, blocked hostnames, and IP literals.
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

  if (isNumericObfuscatedIp(hostname)) {
    throw new SecuritySSRFError(rawUrl, `Access to numeric/obfuscated IP address '${hostname}' is prohibited`);
  }

  if (isPrivateOrBlockedIp(hostname)) {
    throw new SecuritySSRFError(rawUrl, `Access to private IP range '${hostname}' is prohibited`);
  }

  return parsed;
}

/**
 * Asynchronously resolves DNS to prevent DNS-rebinding attacks where a public domain
 * resolves to 127.0.0.1 or 169.254.169.254.
 */
export async function resolveAndValidateHostname(hostname: string): Promise<string[]> {
  try {
    const nodeDns = typeof window === "undefined" ? eval("require")("node:dns") : null;
    if (!nodeDns?.promises?.lookup) {
      return [];
    }
    const records = await nodeDns.promises.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      throw new SecuritySSRFError(hostname, `DNS resolution failed for '${hostname}'`);
    }

    const resolvedIps = records.map((r: { address: string }) => r.address);
    for (const ip of resolvedIps) {
      if (isPrivateOrBlockedIp(ip)) {
        throw new SecuritySSRFError(
          hostname,
          `DNS rebinding blocked: Host '${hostname}' resolved to private/blocked IP '${ip}'`,
        );
      }
    }
    return resolvedIps;
  } catch (err: unknown) {
    if (err instanceof SecuritySSRFError) throw err;
    throw new SecuritySSRFError(hostname, `DNS resolution error: ${(err as Error)?.message || "Unknown error"}`);
  }
}

/**
 * Full async validation: validates URL schema and performs DNS lookup to ensure
 * no private IPs are returned.
 */
export async function validateSafeUrlAsync(rawUrl: string): Promise<URL> {
  const parsed = validateSafeUrl(rawUrl);
  await resolveAndValidateHostname(parsed.hostname);
  return parsed;
}

export interface SafeFetchOptions extends RequestInit {
  maxRedirects?: number;
  timeoutMs?: number;
}

/**
 * Secure HTTP client that defends against SSRF redirect chains and DNS rebinding.
 * Follows redirects manually (up to maxRedirects), strictly validating every hop.
 */
export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const maxRedirects = options.maxRedirects ?? 5;
  const timeoutMs = options.timeoutMs ?? 10000;

  let currentUrl = url;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    // 1. Validate destination on this hop (validates format, hostname & DNS resolution)
    await validateSafeUrlAsync(currentUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(currentUrl, {
        ...options,
        redirect: "manual", // ALWAYS manual redirect to inspect each hop
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check for redirect status (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const locationHeader = response.headers.get("location");
        if (!locationHeader) {
          return response;
        }

        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          throw new SecuritySSRFError(url, `Exceeded maximum redirect hops (${maxRedirects})`);
        }

        // Resolve relative redirect locations
        currentUrl = new URL(locationHeader, currentUrl).toString();
        continue;
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof SecuritySSRFError) throw err;
      throw err;
    }
  }

  throw new SecuritySSRFError(url, "Too many redirects");
}
