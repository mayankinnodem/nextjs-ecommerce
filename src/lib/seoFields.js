export function parseKeywords(keywords) {
  if (!keywords) return undefined;
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function pickSeoFields(source = {}) {
  if (!source) return {};
  return {
    metaTitle: source.metaTitle || "",
    metaDescription: source.metaDescription || "",
    metaKeywords: source.metaKeywords || "",
    ogTitle: source.ogTitle || "",
    ogDescription: source.ogDescription || "",
    ogImage: source.ogImage || null,
    canonicalUrl: source.canonicalUrl || "",
    publisher: source.publisher || "",
    language: source.language || "",
    structuredData: source.structuredData || null,
    robotsIndex: source.robotsIndex !== false,
    robotsFollow: source.robotsFollow !== false,
  };
}
