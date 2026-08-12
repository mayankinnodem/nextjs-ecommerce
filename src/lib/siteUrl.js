/**
 * Resolve the current site domain and base URL from request headers, database, or env.
 */

import { connectDB } from "@/lib/dbConnect";
import SeoSettings from "@/models/SeoSettings";
import { resolveSiteDomain } from "@/lib/siteDatabase";

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
  // 1. Live request host (most accurate for multi-site)
  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host");
    if (host) {
      const proto = request.headers.get("x-forwarded-proto") || "https";
      return `${proto}://${host.split(",")[0].trim()}`.replace(/\/$/, "");
    }
  }

  const fromHeaders = await getRequestDomain();
  if (fromHeaders) {
    return `https://${fromHeaders}`.replace(/\/$/, "");
  }

  // 2. Site URL stored in this website's database
  try {
    await connectDB(request);
    const settings = await SeoSettings.findOne().select("siteUrl").lean();
    if (settings?.siteUrl?.trim()) {
      return settings.siteUrl.trim().replace(/\/$/, "");
    }
  } catch {
    // DB unavailable during build
  }

  // 3. Environment fallback
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export async function getCurrentSiteDomain(request) {
  return resolveSiteDomain(request);
}
