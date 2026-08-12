import { normalizeDomain, getDomainFromEnv } from "@/lib/siteUrl";

let dbMapCache = null;

/** Parse SITE_DB_MAP env: {"rmkleathercraft.com":"rmk","tarkeshwarartsglobal.com":"Tarkeshwar"} */
export function getSiteDbMap() {
  if (dbMapCache) return dbMapCache;

  const raw = process.env.SITE_DB_MAP || "";
  if (!raw.trim()) {
    dbMapCache = {};
    return dbMapCache;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = {};
    for (const [host, dbName] of Object.entries(parsed)) {
      if (host && dbName) {
        normalized[normalizeDomain(host)] = String(dbName).trim();
      }
    }
    dbMapCache = normalized;
  } catch {
    console.error("Invalid SITE_DB_MAP JSON — using MONGODB_URI database only");
    dbMapCache = {};
  }

  return dbMapCache;
}

/** Extract default database name from MONGODB_URI path segment */
export function getDefaultDbNameFromUri(uri = process.env.MONGODB_URI) {
  if (!uri) return "";
  const withoutQuery = uri.split("?")[0];
  const parts = withoutQuery.split("/");
  const name = parts[parts.length - 1]?.trim();
  if (!name || name.includes("@") || name.includes(":")) return "";
  return name;
}

/** Resolve MongoDB database name for the active website domain */
export function getDbNameForDomain(domain) {
  const normalized = normalizeDomain(domain);
  const map = getSiteDbMap();

  if (normalized && map[normalized]) {
    return map[normalized];
  }

  return getDefaultDbNameFromUri();
}

/** Build full URI with a specific database name (same cluster/credentials) */
export function buildMongoUriWithDb(dbName, baseUri = process.env.MONGODB_URI) {
  if (!baseUri) return "";
  if (!dbName) return baseUri;

  return baseUri.replace(
    /^(mongodb(\+srv)?:\/\/[^/]+)(\/[^?]*)?(\?.*)?$/,
    (_, base, _srv, _db, query) => `${base}/${dbName}${query || ""}`
  );
}

export async function resolveDatabaseName(request) {
  if (request) {
    const host =
      request.headers?.get("x-forwarded-host") ||
      request.headers?.get("host") ||
      "";
    const domain = normalizeDomain(host.split(",")[0].trim());
    if (domain) return getDbNameForDomain(domain);
  }

  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "";
    const domain = normalizeDomain(host.split(",")[0].trim());
    if (domain) return getDbNameForDomain(domain);
  } catch {
    // outside request context
  }

  return getDbNameForDomain(getDomainFromEnv());
}

export async function resolveSiteDomain(request) {
  if (request) {
    const host =
      request.headers?.get("x-forwarded-host") ||
      request.headers?.get("host") ||
      "";
    const domain = normalizeDomain(host.split(",")[0].trim());
    if (domain) return domain;
  }

  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "";
    const domain = normalizeDomain(host.split(",")[0].trim());
    if (domain) return domain;
  } catch {
    // outside request context
  }

  return getDomainFromEnv();
}
