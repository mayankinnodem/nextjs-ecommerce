"use client";

import { useEffect, useState } from "react";
import SeoFieldsForm from "@/components/admin/SeoFieldsForm";
import { structuredDataToText } from "@/lib/seoSchema";

export default function SeoAdminPage() {
  const [tab, setTab] = useState("global");
  const [globalSeo, setGlobalSeo] = useState({
    siteName: "",
    titleTemplate: "%s",
    defaultMetaDescription: "",
    defaultMetaKeywords: "",
    googleSiteVerification: "",
    bingSiteVerification: "",
    twitterHandle: "",
    organizationName: "",
    defaultPublisher: "",
    defaultLanguage: "en",
    robotsExtra: "",
  });
  const [ogImageFile, setOgImageFile] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState("");

  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [pageForm, setPageForm] = useState(null);
  const [pageOgFile, setPageOgFile] = useState(null);
  const [pageOgPreview, setPageOgPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [globalRes, pagesRes] = await Promise.all([
        fetch("/api/admin/seo/global"),
        fetch("/api/admin/seo/pages"),
      ]);
      const globalData = await globalRes.json();
      const pagesData = await pagesRes.json();

      if (globalData.success) {
        setGlobalSeo(globalData.settings);
        if (globalData.settings?.defaultOgImage?.url) {
          setOgImagePreview(globalData.settings.defaultOgImage.url);
        }
      }
      if (pagesData.success) {
        setPages(pagesData.pages || []);
        if (pagesData.pages?.length && !selectedPageId) {
          selectPage(pagesData.pages[0]);
        }
      }
    } catch (err) {
      setMessage("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }

  function selectPage(page) {
    setSelectedPageId(page._id);
    setPageForm({
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      ogTitle: page.ogTitle || "",
      ogDescription: page.ogDescription || "",
      canonicalUrl: page.canonicalUrl || "",
      publisher: page.publisher || "",
      language: page.language || "en",
      structuredDataText: structuredDataToText(page.structuredData),
      robotsIndex: page.robotsIndex !== false,
      robotsFollow: page.robotsFollow !== false,
      label: page.label,
      path: page.path,
    });
    setPageOgPreview(page.ogImage?.url || "");
    setPageOgFile(null);
  }

  async function saveGlobal(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(globalSeo));
      if (ogImageFile) formData.append("defaultOgImage", ogImageFile);

      const res = await fetch("/api/admin/seo/global", { method: "PUT", body: formData });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Global SEO saved!");
        if (data.settings?.defaultOgImage?.url) {
          setOgImagePreview(data.settings.defaultOgImage.url);
        }
      } else {
        setMessage("❌ " + data.error);
      }
    } catch {
      setMessage("❌ Failed to save global SEO");
    } finally {
      setSaving(false);
    }
  }

  async function savePage(e) {
    e.preventDefault();
    if (!selectedPageId || !pageForm) return;
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(pageForm));
      if (pageOgFile) formData.append("ogImage", pageOgFile);

      const res = await fetch(`/api/admin/seo/pages/${selectedPageId}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ SEO saved for ${pageForm.label}!`);
        await loadAll();
        if (data.page) selectPage(data.page);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch {
      setMessage("❌ Failed to save page SEO");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6 text-gray-700">Loading SEO settings...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
        <p className="text-gray-600 mt-1">
          Full on-page SEO: meta tags, canonical, publisher, language, robots, Open Graph &amp; JSON-LD schema.
          Each website/domain can have its own settings. Category &amp; product SEO is in their edit forms.
        </p>
      </div>

      {message && (
        <p className="p-3 rounded bg-blue-50 text-blue-800 text-sm">{message}</p>
      )}

      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setTab("global")}
          className={`px-4 py-2 font-medium ${
            tab === "global" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
        >
          Global Settings
        </button>
        <button
          type="button"
          onClick={() => setTab("pages")}
          className={`px-4 py-2 font-medium ${
            tab === "pages" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
        >
          Static Pages ({pages.length})
        </button>
      </div>

      {tab === "global" && (
        <form onSubmit={saveGlobal} className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Site-wide SEO Defaults</h2>

          <input
            type="text"
            placeholder="Site Name (SEO)"
            value={globalSeo.siteName || ""}
            onChange={(e) => setGlobalSeo({ ...globalSeo, siteName: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />

          <textarea
            placeholder="Default Meta Description (used when page has no description)"
            value={globalSeo.defaultMetaDescription || ""}
            onChange={(e) =>
              setGlobalSeo({ ...globalSeo, defaultMetaDescription: e.target.value })
            }
            rows={3}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Default Keywords (comma separated)"
            value={globalSeo.defaultMetaKeywords || ""}
            onChange={(e) =>
              setGlobalSeo({ ...globalSeo, defaultMetaKeywords: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Organization / Publisher name (default for all pages)"
            value={globalSeo.defaultPublisher || globalSeo.organizationName || ""}
            onChange={(e) =>
              setGlobalSeo({
                ...globalSeo,
                defaultPublisher: e.target.value,
                organizationName: e.target.value,
              })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Default language (e.g. en-IN)"
            value={globalSeo.defaultLanguage || "en"}
            onChange={(e) =>
              setGlobalSeo({ ...globalSeo, defaultLanguage: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Google Site Verification code"
            value={globalSeo.googleSiteVerification || ""}
            onChange={(e) =>
              setGlobalSeo({ ...globalSeo, googleSiteVerification: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Bing Site Verification code"
            value={globalSeo.bingSiteVerification || ""}
            onChange={(e) =>
              setGlobalSeo({ ...globalSeo, bingSiteVerification: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Twitter handle (@yourstore)"
            value={globalSeo.twitterHandle || ""}
            onChange={(e) =>
              setGlobalSeo({ ...globalSeo, twitterHandle: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <div>
            <label className="block text-sm text-gray-600 mb-1">Default OG Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setOgImageFile(file || null);
                if (file) setOgImagePreview(URL.createObjectURL(file));
              }}
            />
            {ogImagePreview && (
              <img src={ogImagePreview} alt="OG preview" className="mt-2 w-32 h-32 object-cover rounded border" />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Global SEO"}
          </button>
        </form>
      )}

      {tab === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded shadow p-4 lg:col-span-1 max-h-[70vh] overflow-y-auto">
            <h2 className="font-semibold mb-3 text-gray-900">Pages</h2>
            <ul className="space-y-1">
              {pages.map((page) => (
                <li key={page._id}>
                  <button
                    type="button"
                    onClick={() => selectPage(page)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedPageId === page._id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span className="font-medium block">{page.label}</span>
                    <span className={`text-xs ${selectedPageId === page._id ? "text-blue-100" : "text-gray-500"}`}>
                      {page.path}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            {pageForm ? (
              <form onSubmit={savePage} className="bg-white rounded shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold">{pageForm.label}</h2>
                <SeoFieldsForm
                  value={pageForm}
                  onChange={setPageForm}
                  showPathPreview={pageForm.path}
                  includeSchema
                />
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Page OG Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setPageOgFile(file || null);
                      if (file) setPageOgPreview(URL.createObjectURL(file));
                    }}
                  />
                  {pageOgPreview && (
                    <img src={pageOgPreview} alt="Page OG" className="mt-2 w-32 h-32 object-cover rounded border" />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Page SEO"}
                </button>
              </form>
            ) : (
              <p className="text-gray-500">Select a page to edit SEO</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
        <strong>Dynamic pages:</strong> Category pages (<code>/category-slug</code>) and product pages (
        <code>/category-slug/product-slug</code>) have SEO fields in their edit forms under Products → Categories / Products.
      </div>
    </div>
  );
}
