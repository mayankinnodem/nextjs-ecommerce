import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import SeoSettings from "@/models/SeoSettings";
import { getContactSection } from "@/lib/staticData";
import { getSiteUrl } from "@/lib/siteUrl";
import { getSiteMetadata } from "@/lib/metadata";
import { STATIC_SEO_PAGES } from "@/lib/seoConstants";
import { toOpenGraphLocale } from "@/lib/seoSchema";
import { pickSeoFields, parseKeywords } from "@/lib/seoFields";
import { getResolvedSeoForPath, syncAllSeoPages } from "@/lib/seoSync";
import { normalizeSeoPath } from "@/lib/seoPath";

/** Collapse repeated trailing " | SiteName" (e.g. "Page | Brand | Brand" → "Page | Brand"). */
function normalizePageTitle(title, siteName) {
  if (!title) return title;
  let result = String(title).trim();
  if (!siteName) return result;

  const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const repeated = new RegExp(
    `(\\s*\\|\\s*${escaped})(\\s*\\|\\s*${escaped})+$`,
    "i"
  );
  return result.replace(repeated, "$1");
}

export async function getGlobalSeoSettings() {
  try {
    await connectDB();
    let settings = await SeoSettings.findOne().lean();
    if (!settings) {
      settings = await SeoSettings.create({});
      settings = settings.toObject();
    }
    return settings;
  } catch (error) {
    console.error("Error fetching global SEO settings:", error);
    return {};
  }
}

export async function ensureStaticPageSeoRecords() {
  await connectDB();
  for (const page of STATIC_SEO_PAGES) {
    await PageSeo.findOneAndUpdate(
      { path: page.path },
      {
        $setOnInsert: {
          path: page.path,
          label: page.label,
          pageType: "static",
          robotsIndex: page.robotsIndex !== false,
          robotsFollow: true,
        },
      },
      { upsert: true, new: true }
    );
  }
}

export async function getPageSeoByPath(path) {
  try {
    await connectDB();
    const normalizedPath = normalizeSeoPath(path);
    return PageSeo.findOne({ path: normalizedPath, status: "active" }).lean();
  } catch (error) {
    console.error("Error fetching page SEO:", error);
    return null;
  }
}

export async function getAllPageSeoRecords({ sync = true, request } = {}) {
  await connectDB(request);
  if (sync) {
    try {
      await syncAllSeoPages(request);
    } catch (err) {
      console.error("SEO sync warning:", err.message);
    }
  } else {
    await ensureStaticPageSeoRecords();
  }
  return PageSeo.find().sort({ pageType: 1, label: 1 }).lean();
}

export async function buildMetadataFromSeo({ seo = {}, fallback = {}, path = "" }) {
  const [global, contact, siteUrl] = await Promise.all([
    getGlobalSeoSettings(),
    getContactSection(),
    getSiteUrl(),
  ]);

  const siteName = global.siteName || contact.siteName || "Store";
  const seoData = pickSeoFields(seo);

  const description =
    seoData.metaDescription ||
    fallback.description ||
    global.defaultMetaDescription ||
    contact.description ||
    "";

  const ogTitle = seoData.ogTitle || seoData.metaTitle || fallback.title || siteName;
  const ogDescription = seoData.ogDescription || description;
  const ogImage =
    seoData.ogImage?.url ||
    fallback.image ||
    global.defaultOgImage?.url ||
    contact.logo?.url ||
    "";

  const canonical =
    seoData.canonicalUrl ||
    (path ? `${siteUrl}${path.startsWith("/") ? path : `/${path}`}` : siteUrl);

  const keywords =
    parseKeywords(seoData.metaKeywords) ||
    parseKeywords(global.defaultMetaKeywords);

  const publisher =
    seoData.publisher ||
    global.defaultPublisher ||
    global.organizationName ||
    siteName;

  const language =
    seoData.language ||
    global.defaultLanguage ||
    "en";

  const ogLocale = toOpenGraphLocale(language);

  // Always use `absolute` so layout titleTemplate never appends the brand twice
  // (DB meta titles already include the company name).
  const rawTitle = (seoData.metaTitle || fallback.title || siteName).trim();
  const pageTitle = { absolute: normalizePageTitle(rawTitle, siteName) };

  const metadata = await getSiteMetadata({
    title: pageTitle,
    description,
    keywords,
    robots: {
      index: seoData.robotsIndex !== false,
      follow: seoData.robotsFollow !== false,
    },
    alternates: {
      canonical,
      ...(language ? { languages: { [language]: canonical } } : {}),
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: ogImage ? [ogImage] : [],
      ...(ogLocale ? { locale: ogLocale } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
      ...(global.twitterHandle ? { site: global.twitterHandle } : {}),
    },
    other: {
      publisher,
    },
    ...(global.googleSiteVerification
      ? { verification: { google: global.googleSiteVerification } }
      : {}),
  });

  return metadata;
}

/** Universal metadata builder — works for any path on the site */
export async function buildPageMetadata(path, fallback = {}, entitySeo = null) {
  const normalizedPath = normalizeSeoPath(path);
  const resolvedSeo = await getResolvedSeoForPath(normalizedPath, entitySeo);
  return buildMetadataFromSeo({
    seo: resolvedSeo || {},
    fallback,
    path: normalizedPath,
  });
}

export async function buildStaticPageMetadata(path, fallback = {}) {
  return buildPageMetadata(path, fallback);
}

export async function buildCategoryMetadata(category, categorySlug) {
  const path = `/${categorySlug}`;
  const fallback = {
    title: category.name,
    description:
      category.description || `Browse ${category.name} products`,
    image: category.image?.url || category.seo?.ogImage?.url || "",
  };

  return buildPageMetadata(path, fallback, category.seo || {});
}

export async function buildProductMetadata(product, categorySlug, productSlug) {
  const path = `/${categorySlug}/${productSlug}`;
  const price = product.salePrice || product.price;
  const fallback = {
    title: product.name,
    description:
      product.description ||
      `Buy ${product.name} at ₹${price}`,
    image:
      product.seo?.ogImage?.url ||
      product.images?.[0]?.url ||
      "",
  };

  return buildPageMetadata(path, fallback, product.seo || {});
}

export async function getResolvedStructuredData(path, entitySeo = null) {
  const resolved = await getResolvedSeoForPath(path, entitySeo);
  return resolved?.structuredData || null;
}

export { pickSeoFields, parseKeywords };
