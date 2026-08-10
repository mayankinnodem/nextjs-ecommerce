"use client";

import { useEffect, useMemo, useState } from "react";
import SeoFieldsForm from "@/components/admin/SeoFieldsForm";
import { structuredDataToText } from "@/lib/seoSchema";

const PAGE_TYPE_LABELS = {
  static: "Static",
  category: "Category",
  product: "Product",
  custom: "Custom",
};

const PAGE_TYPE_COLORS = {
  static: "bg-blue-100 text-blue-800",
  category: "bg-purple-100 text-purple-800",
  product: "bg-green-100 text-green-800",
  custom: "bg-orange-100 text-orange-800",
};

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
  const [selectedPageMeta, setSelectedPageMeta] = useState(null);
  const [pageOgFile, setPageOgFile] = useState(null);
  const [pageOgPreview, setPageOgPreview] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPage, setNewPage] = useState({ path: "", label: "" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [globalRes, pagesRes] = await Promise.all([
        fetch("/api/admin/seo/global"),
        fetch("/api/admin/seo/pages?sync=true"),
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
      }
    } catch {
      setMessage("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesType =
        typeFilter === "all" || page.pageType === typeFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        page.label?.toLowerCase().includes(q) ||
        page.path?.toLowerCase().includes(q) ||
        page.metaTitle?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [pages, search, typeFilter]);

  function selectPage(page) {
    setSelectedPageId(page._id);
    setSelectedPageMeta(page);
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

  async function syncPages() {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seo/pages/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        await loadAll();
      } else {
        setMessage("❌ " + data.error);
      }
    } catch {
      setMessage("❌ Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function addCustomPage(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Custom page ${newPage.path} added!`);
        setNewPage({ path: "", label: "" });
        setShowAddForm(false);
        await loadAll();
        if (data.page) selectPage(data.page);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch {
      setMessage("❌ Failed to add page");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomPage() {
    if (!selectedPageId || !selectedPageMeta?.isCustom) return;
    if (!confirm(`Delete custom page ${selectedPageMeta.path}?`)) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/seo/pages/${selectedPageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Custom page deleted");
        setSelectedPageId("");
        setPageForm(null);
        setSelectedPageMeta(null);
        await loadAll();
      } else {
        setMessage("❌ " + data.error);
      }
    } catch {
      setMessage("❌ Delete failed");
    } finally {
      setSaving(false);
    }
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
        setMessage(`✅ SEO saved for ${data.page.path}!`);
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

  const isCustomPage =
    selectedPageMeta?.isCustom || selectedPageMeta?.pageType === "custom";

  if (loading) {
    return <p className="p-6 text-gray-700">Loading SEO settings...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
        <p className="text-gray-600 mt-1">
          Manage SEO for every page on your website — static pages, categories, products,
          and custom URLs. All pages are auto-discovered when you sync.
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
          All Pages ({pages.length})
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
            placeholder="Default Meta Description"
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
            placeholder="Organization / Publisher name"
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
              <img
                src={ogImagePreview}
                alt="OG preview"
                className="mt-2 w-32 h-32 object-cover rounded border"
              />
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
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center bg-white rounded shadow p-4">
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border px-3 py-2 rounded text-sm"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="all">All types</option>
              <option value="static">Static</option>
              <option value="category">Category</option>
              <option value="product">Product</option>
              <option value="custom">Custom</option>
            </select>
            <button
              type="button"
              onClick={syncPages}
              disabled={syncing}
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900 disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync All Pages"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              + Add Custom Page
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={addCustomPage}
              className="bg-green-50 border border-green-200 rounded p-4 flex flex-wrap gap-3 items-end"
            >
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-gray-600 mb-1">Path</label>
                <input
                  type="text"
                  placeholder="/my-custom-page"
                  value={newPage.path}
                  onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                  className="w-full border px-3 py-2 rounded text-sm"
                  required
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-gray-600 mb-1">Label</label>
                <input
                  type="text"
                  placeholder="Page label"
                  value={newPage.label}
                  onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                Add
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded shadow p-4 lg:col-span-1 max-h-[70vh] overflow-y-auto">
              <h2 className="font-semibold mb-3 text-gray-900">
                Pages ({filteredPages.length})
              </h2>
              <ul className="space-y-1">
                {filteredPages.map((page) => (
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium block truncate flex-1">
                          {page.label}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                            selectedPageId === page._id
                              ? "bg-blue-500 text-white"
                              : PAGE_TYPE_COLORS[page.pageType] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {PAGE_TYPE_LABELS[page.pageType] || page.pageType}
                        </span>
                      </div>
                      <span
                        className={`text-xs block truncate ${
                          selectedPageId === page._id ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {page.path}
                        {page.metaTitle ? " ✓" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {filteredPages.length === 0 && (
                <p className="text-gray-500 text-sm">No pages match your search.</p>
              )}
            </div>

            <div className="lg:col-span-2">
              {pageForm ? (
                <form onSubmit={savePage} className="bg-white rounded shadow p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{pageForm.label}</h2>
                      {selectedPageMeta && (
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                            PAGE_TYPE_COLORS[selectedPageMeta.pageType]
                          }`}
                        >
                          {PAGE_TYPE_LABELS[selectedPageMeta.pageType]}
                        </span>
                      )}
                    </div>
                    {isCustomPage && (
                      <button
                        type="button"
                        onClick={deleteCustomPage}
                        className="text-red-600 text-sm hover:underline shrink-0"
                      >
                        Delete page
                      </button>
                    )}
                  </div>

                  {isCustomPage && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Page path (e.g. /offers)"
                        value={pageForm.path || ""}
                        onChange={(e) =>
                          setPageForm({ ...pageForm, path: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Page label"
                        value={pageForm.label || ""}
                        onChange={(e) =>
                          setPageForm({ ...pageForm, label: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                  )}

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
                      <img
                        src={pageOgPreview}
                        alt="Page OG"
                        className="mt-2 w-32 h-32 object-cover rounded border"
                      />
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
                <p className="text-gray-500 bg-white rounded shadow p-6">
                  Select a page from the list to edit its SEO, or click &quot;Sync All Pages&quot;
                  to discover categories and products.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-900">
        <strong>How it works:</strong> Click &quot;Sync All Pages&quot; to auto-add every static
        page, category (<code>/slug</code>), and product (<code>/category/product</code>) to this
        list. You can also add any custom URL manually. SEO saved here applies on the live site
        for that exact path.
      </div>
    </div>
  );
}
