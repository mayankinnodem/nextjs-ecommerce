import { CATEGORY_I18N } from "@/lib/categoryTranslations";

/**
 * Pick a localized string from CMS/API records.
 * - Uses record.translations[lang][field] when present
 * - Uses record[field] only for English
 * - Otherwise returns fallback (usually a UI translation)
 */
export function pickLocalized(record, field, language, fallback = "") {
  if (!record) return fallback;

  const fromDb = record?.translations?.[language]?.[field];
  if (fromDb) return fromDb;

  if (language === "en" && record[field]) return record[field];

  return fallback;
}

export function categoryDisplayName(category, language) {
  if (!category) return "";

  const fromDb = category?.translations?.[language]?.name;
  if (fromDb) return fromDb;

  const fromMap = CATEGORY_I18N[category.slug]?.[language];
  if (fromMap) return fromMap;

  return category.name || "";
}

export function categoryDescription(category, language) {
  if (!category) return "";

  const fromDb = category?.translations?.[language]?.description;
  if (fromDb) return fromDb;

  const fromMap = CATEGORY_I18N[category.slug]?.[`description_${language}`];
  if (fromMap) return fromMap;

  if (language === "en" && category.description) return category.description;

  const name = categoryDisplayName(category, language);
  return name && name !== category.name ? name : category.description || "";
}
