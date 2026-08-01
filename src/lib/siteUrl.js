/**
 * Resolve the current site domain and base URL from request headers or env.
 */

export function normalizeDomain(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split(":")[0]
    .replace(/^www\./, "");
}

export function getDomainFromEnv() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (!baseUrl) return "";

  try {
    return normalizeDomain(new URL(baseUrl).hostname);
  } catch {
    return normalizeDomain(baseUrl);
  }
}

export async function getRequestDomain() {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "";
    return normalizeDomain(host.split(",")[0].trim());
  } catch {
    return "";
  }
}

export function getDomainFromRequest(request) {
  const host =
    request?.headers?.get("x-forwarded-host") ||
    request?.headers?.get("host") ||
    "";
  return normalizeDomain(host.split(",")[0].trim());
}

export async function resolveDomain(request) {
  if (request) {
    return getDomainFromRequest(request) || getDomainFromEnv();
  }

  const fromHeaders = await getRequestDomain();
  return fromHeaders || getDomainFromEnv();
}

export async function getSiteUrl(request) {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host");
    if (host) {
      const proto = request.headers.get("x-forwarded-proto") || "https";
      return `${proto}://${host.split(",")[0].trim()}`.replace(/\/$/, "");
    }
  }

  const domain = await getRequestDomain();
  if (domain) return `https://${domain}`;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
