/** Format structured data for admin textarea */
export function structuredDataToText(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "";
  }
}

/** Parse JSON-LD from admin textarea */
export function parseStructuredDataText(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;
  const parsed = JSON.parse(trimmed);
  if (parsed === null || typeof parsed !== "object") {
    throw new Error("Schema must be a JSON object");
  }
  return parsed;
}

/** Normalize seo subdocument from admin forms */
export function normalizeSeoBlock(seo) {
  if (!seo || typeof seo !== "object") return seo;
  const normalized = { ...seo };
  if ("structuredDataText" in normalized) {
    normalized.structuredData = parseStructuredDataText(normalized.structuredDataText);
    delete normalized.structuredDataText;
  }
  return normalized;
}

/** Open Graph locale from BCP 47 tag (en-IN → en_IN) */
export function toOpenGraphLocale(language) {
  if (!language) return undefined;
  return language.trim().replace("-", "_");
}

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (en)" },
  { value: "en-IN", label: "English India (en-IN)" },
  { value: "en-US", label: "English US (en-US)" },
  { value: "hi", label: "Hindi (hi)" },
  { value: "hi-IN", label: "Hindi India (hi-IN)" },
];
