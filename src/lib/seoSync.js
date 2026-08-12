import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { STATIC_SEO_PAGES } from "@/lib/seoConstants";
import { normalizeSeoPath } from "@/lib/seoPath";
import { pickSeoFields } from "@/lib/seoFields";

const SEO_FIELD_KEYS = [
  "metaTitle",
  "metaDescription",
  "metaKeywords",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "canonicalUrl",
  "publisher",
  "language",
  "structuredData",
  "robotsIndex",
  "robotsFollow",
];

function hasSeoValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return true;
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.length > 0;
    if (value.url) return Boolean(value.url.trim?.() || value.url);
    return Object.keys(value).length > 0;
  }
  return true;
}

/** Merge SEO: primary (PageSeo) wins when field has a value, else secondary (entity) */
export function mergeSeoFields(primary = {}, secondary = {}) {
  const a = pickSeoFields(primary);
  const b = pickSeoFields(secondary);
  const merged = { ...b };

  for (const key of SEO_FIELD_KEYS) {
    if (hasSeoValue(a[key])) {
      merged[key] = a[key];
    }
  }

  return merged;
}

async function upsertPageStub({ path, label, pageType, sourceId, sourceModel, status }) {
  return PageSeo.findOneAndUpdate(
    { path },
    {
      $setOnInsert: {
        path,
        label,
        pageType,
        sourceId: sourceId || null,
        sourceModel: sourceModel || null,
        isCustom: pageType === "custom",
        robotsIndex: pageType !== "cart" && !path.includes("checkout"),
        robotsFollow: true,
      },
      $set: {
        label,
        pageType,
        sourceId: sourceId || null,
        sourceModel: sourceModel || null,
        status: status || "active",
      },
    },
    { upsert: true, new: true }
  );
}

/** Sync all known routes into PageSeo (static + categories + products). Does not wipe existing SEO content. */
export async function syncAllSeoPages(request) {
  await connectDB(request);

  let created = 0;
  let updated = 0;

  for (const page of STATIC_SEO_PAGES) {
    const path = normalizeSeoPath(page.path);
    const existing = await PageSeo.findOne({ path });
    await upsertPageStub({
      path,
      label: page.label,
      pageType: "static",
      status: "active",
    });
    if (!existing) created++;
    else updated++;
  }

  const categories = await Category.find().select("_id name slug status seo").lean();
  for (const cat of categories) {
    const path = normalizeSeoPath(`/${cat.slug}`);
    const existing = await PageSeo.findOne({ path });
    await upsertPageStub({
      path,
      label: `Category: ${cat.name}`,
      pageType: "category",
      sourceId: cat._id,
      sourceModel: "Category",
      status: cat.status === "active" ? "active" : "inactive",
    });
    if (cat.seo && hasSeoValue(cat.seo.metaTitle)) {
      await syncEntitySeoToPage({
        path,
        label: `Category: ${cat.name}`,
        pageType: "category",
        sourceId: cat._id,
        sourceModel: "Category",
        seo: cat.seo,
        status: cat.status === "active" ? "active" : "inactive",
      });
    }
    if (!existing) created++;
    else updated++;
  }

  const products = await Product.find()
    .select("_id name slug status seo category")
    .populate("category", "slug name status")
    .lean();

  for (const product of products) {
    if (!product.category?.slug) continue;
    const path = normalizeSeoPath(`/${product.category.slug}/${product.slug}`);
    const existing = await PageSeo.findOne({ path });
    const active =
      product.status === "active" && product.category.status === "active";
    await upsertPageStub({
      path,
      label: `Product: ${product.name}`,
      pageType: "product",
      sourceId: product._id,
      sourceModel: "Product",
      status: active ? "active" : "inactive",
    });
    if (product.seo && hasSeoValue(product.seo.metaTitle)) {
      await syncEntitySeoToPage({
        path,
        label: `Product: ${product.name}`,
        pageType: "product",
        sourceId: product._id,
        sourceModel: "Product",
        seo: product.seo,
        status: active ? "active" : "inactive",
      });
    }
    if (!existing) created++;
    else updated++;
  }

  return { created, updated, total: await PageSeo.countDocuments() };
}

/** Write entity SEO into PageSeo (category/product forms → unified SEO store) */
export async function syncEntitySeoToPage({
  path,
  label,
  pageType,
  sourceId,
  sourceModel,
  seo,
  status = "active",
}) {
  await connectDB();
  const normalizedPath = normalizeSeoPath(path);
  const seoData = pickSeoFields(seo || {});

  const update = {
    path: normalizedPath,
    label,
    pageType,
    sourceId: sourceId || null,
    sourceModel: sourceModel || null,
    isCustom: false,
    status,
    ...seoData,
  };

  return PageSeo.findOneAndUpdate(
    { path: normalizedPath },
    { $set: update },
    { upsert: true, new: true }
  );
}

/** Resolve final SEO for any path — PageSeo (admin DB) is primary; entity SEO is fallback only */
export async function getResolvedSeoForPath(path, entitySeo = null) {
  await connectDB();
  const normalizedPath = normalizeSeoPath(path);
  const pageSeo = await PageSeo.findOne({
    path: normalizedPath,
    status: "active",
  }).lean();

  if (pageSeo) {
    const picked = pickSeoFields(pageSeo);
    const hasPageContent =
      hasSeoValue(pageSeo.metaTitle) ||
      hasSeoValue(pageSeo.metaDescription) ||
      hasSeoValue(pageSeo.structuredData);

    if (hasPageContent) {
      return picked;
    }
  }

  if (entitySeo && hasSeoValue(entitySeo.metaTitle)) {
    return pickSeoFields(entitySeo);
  }

  if (pageSeo) return pickSeoFields(pageSeo);
  if (entitySeo) return pickSeoFields(entitySeo);
  return null;
}

export async function createCustomPageSeo({ path, label }) {
  await connectDB();
  const normalizedPath = normalizeSeoPath(path);

  const existing = await PageSeo.findOne({ path: normalizedPath });
  if (existing) {
    throw new Error("A page with this path already exists");
  }

  return PageSeo.create({
    path: normalizedPath,
    label: label || normalizedPath,
    pageType: "custom",
    isCustom: true,
    status: "active",
    robotsIndex: true,
    robotsFollow: true,
  });
}

export async function deleteCustomPageSeo(id) {
  await connectDB();
  const page = await PageSeo.findById(id);
  if (!page) throw new Error("Page not found");
  if (!page.isCustom && page.pageType !== "custom") {
    throw new Error("Only custom pages can be deleted. Synced pages are managed automatically.");
  }
  await PageSeo.findByIdAndDelete(id);
  return page;
}

export async function syncCategoryPageSeo(category) {
  if (!category?.slug) return null;
  return syncEntitySeoToPage({
    path: `/${category.slug}`,
    label: `Category: ${category.name}`,
    pageType: "category",
    sourceId: category._id,
    sourceModel: "Category",
    seo: category.seo,
    status: category.status === "active" ? "active" : "inactive",
  });
}

export async function syncProductPageSeo(product) {
  await connectDB();
  let category = product.category;
  if (!category?.slug) {
    category = await Category.findById(product.category)
      .select("slug status")
      .lean();
  }
  if (!category?.slug || !product.slug) return null;

  const active =
    product.status === "active" && category.status === "active";

  return syncEntitySeoToPage({
    path: `/${category.slug}/${product.slug}`,
    label: `Product: ${product.name}`,
    pageType: "product",
    sourceId: product._id,
    sourceModel: "Product",
    seo: product.seo,
    status: active ? "active" : "inactive",
  });
}

export async function deactivatePageSeoByPath(path) {
  await connectDB();
  return PageSeo.findOneAndUpdate(
    { path: normalizeSeoPath(path) },
    { status: "inactive" },
    { new: true }
  );
}

/** When SEO is saved from admin panel, mirror back to Category/Product document */
export async function mirrorPageSeoToEntity(page) {
  if (!page?.sourceId || !page?.sourceModel) return;

  await connectDB();
  const seoPayload = pickSeoFields(page);

  if (page.sourceModel === "Category") {
    await Category.findByIdAndUpdate(page.sourceId, { seo: seoPayload });
  } else if (page.sourceModel === "Product") {
    await Product.findByIdAndUpdate(page.sourceId, { seo: seoPayload });
  }
}
