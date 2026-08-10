import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import SeoSettings from "@/models/SeoSettings";
import { getContactSection } from "@/lib/staticData";
import { getSiteUrl } from "@/lib/siteUrl";
import { getSiteMetadata } from "@/lib/metadata";
import { STATIC_SEO_PAGES } from "@/lib/seoConstants";
import { toOpenGraphLocale } from "@/lib/seoSchema";

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
    await ensureStaticPageSeoRecords();
    return PageSeo.findOne({ path, status: "active" }).lean();
  } catch (error) {
    console.error("Error fetching page SEO:", error);
    return null;
  }
}

export async function getAllPageSeoRecords() {
  await connectDB();
  await ensureStaticPageSeoRecords();
  return PageSeo.find().sort({ label: 1 }).lean();
}

function parseKeywords(keywords) {
  if (!keywords) return undefined;
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function pickSeoFields(source = {}) {
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

export async function buildMetadataFromSeo({ seo = {}, fallback = {}, path = "" }) {
  const [global, contact, siteUrl] = await Promise.all([
    getGlobalSeoSettings(),
    getContactSection(),
    getSiteUrl(),
  ]);

  const siteName = global.siteName || contact.siteName || "Store";
  const seoData = pickSeoFields(seo);

  const title =
    seoData.metaTitle ||
    fallback.title ||
    siteName;

  const description =
    seoData.metaDescription ||
    fallback.description ||
    global.defaultMetaDescription ||
    contact.description ||
    "";

  const ogTitle = seoData.ogTitle || title;
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

  const metadata = await getSiteMetadata({
    title,
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

export async function buildStaticPageMetadata(path, fallback = {}) {
  const pageSeo = await getPageSeoByPath(path);
  return buildMetadataFromSeo({
    seo: pageSeo || {},
    fallback,
    path,
  });
}

export async function buildCategoryMetadata(category, categorySlug) {
  const path = `/${categorySlug}`;
  const fallback = {
    title: category.name,
    description:
      category.description || `Browse ${category.name} products`,
    image: category.image?.url || category.seo?.ogImage?.url || "",
  };

  return buildMetadataFromSeo({
    seo: category.seo || {},
    fallback,
    path,
  });
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

  return buildMetadataFromSeo({
    seo: product.seo || {},
    fallback,
    path,
  });
}

export { pickSeoFields, parseKeywords };
