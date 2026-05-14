// Server-Side Request Forgery guard.
//
// Every endpoint that fetches a user-supplied URL must call assertExternalUrl()
// before issuing the request. Blocks localhost, private network ranges,
// link-local addresses, and metadata services.

const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,           // link-local (incl. AWS/GCP metadata 169.254.169.254)
  /^::1$/,                 // IPv6 loopback
  /^fc/i,                  // IPv6 unique-local
  /^fd/i,
  /^fe80/i                 // IPv6 link-local
];

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export class UnsafeUrlError extends Error {
  constructor(public readonly url: string, public readonly reason: string) {
    super(`Refusing to fetch unsafe URL: ${url} (${reason})`);
    this.name = "UnsafeUrlError";
  }
}

export function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return PRIVATE_HOST_PATTERNS.some((rx) => rx.test(h));
}

export function assertExternalUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UnsafeUrlError(url, "invalid URL");
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new UnsafeUrlError(url, `protocol ${parsed.protocol} not allowed`);
  }
  if (isPrivateHostname(parsed.hostname)) {
    throw new UnsafeUrlError(url, "private/local address");
  }
  return parsed;
}

// Optional allow-list override for explicit user-trusted local hosts
// (e.g. when the OPS env var grants the operator permission).
export function assertExternalUrlOrLocalAllowed(url: string): URL {
  const allowLocal = process.env.BLOGPILOT_ALLOW_LOCAL_FETCH === "1";
  if (allowLocal) {
    try { return new URL(url); } catch { /* fall through */ }
  }
  return assertExternalUrl(url);
}
