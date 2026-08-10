/** Normalize URL path for SEO storage (always starts with /, no trailing slash except root) */
export function normalizeSeoPath(path) {
  if (!path || typeof path !== "string") return "/";
  let normalized = path.trim();
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function isValidSeoPath(path) {
  const normalized = normalizeSeoPath(path);
  if (normalized === "/") return true;
  return /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(
    normalized
  );
}
