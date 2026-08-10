"use client";

import { LANGUAGE_OPTIONS } from "@/lib/seoSchema";

const EMPTY = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogTitle: "",
  ogDescription: "",
  canonicalUrl: "",
  publisher: "",
  language: "en",
  structuredDataText: "",
  robotsIndex: true,
  robotsFollow: true,
};

export default function SeoFieldsForm({
  value = {},
  onChange,
  showPathPreview,
  includeSchema = false,
}) {
  const seo = { ...EMPTY, ...value };

  const update = (field, val) => {
    onChange({ ...seo, [field]: val });
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900">On-Page SEO</h3>

      {showPathPreview && (
        <p className="text-xs text-gray-500">
          Page URL: <span className="font-mono">{showPathPreview}</span>
        </p>
      )}

      <input
        type="text"
        placeholder="Meta Title (browser tab & Google)"
        value={seo.metaTitle}
        onChange={(e) => update("metaTitle", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <textarea
        placeholder="Meta Description (150-160 chars recommended)"
        value={seo.metaDescription}
        onChange={(e) => update("metaDescription", e.target.value)}
        rows={3}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        placeholder="Meta Keywords (comma separated)"
        value={seo.metaKeywords}
        onChange={(e) => update("metaKeywords", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        placeholder="Canonical URL (full URL, e.g. https://yoursite.com/about)"
        value={seo.canonicalUrl}
        onChange={(e) => update("canonicalUrl", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Publisher (e.g. RMK Leather Craft)"
          value={seo.publisher}
          onChange={(e) => update("publisher", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <select
          value={seo.language || "en"}
          onChange={(e) => update("language", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Open Graph Title (social share — optional)"
        value={seo.ogTitle}
        onChange={(e) => update("ogTitle", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <textarea
        placeholder="Open Graph Description (optional)"
        value={seo.ogDescription}
        onChange={(e) => update("ogDescription", e.target.value)}
        rows={2}
        className="w-full border px-3 py-2 rounded"
      />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={seo.robotsIndex !== false}
            onChange={(e) => update("robotsIndex", e.target.checked)}
          />
          index (allow Google indexing)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={seo.robotsFollow !== false}
            onChange={(e) => update("robotsFollow", e.target.checked)}
          />
          follow (allow link crawling)
        </label>
      </div>

      {includeSchema && (
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            JSON-LD Schema (structured data)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Paste valid JSON only — no &lt;script&gt; tags. Use @graph for multiple schema types.
          </p>
          <textarea
            placeholder='{"@context":"https://schema.org","@graph":[...]}'
            value={seo.structuredDataText || ""}
            onChange={(e) => update("structuredDataText", e.target.value)}
            rows={14}
            className="w-full border px-3 py-2 rounded font-mono text-xs"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

export { EMPTY as EMPTY_SEO_FIELDS };
