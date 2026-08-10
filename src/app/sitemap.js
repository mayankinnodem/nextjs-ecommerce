import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import PageSeo from "@/models/PageSeo";
import { getSiteUrl } from "@/lib/siteUrl";
import { ensureStaticPageSeoRecords } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = await getSiteUrl();
  await connectDB();
  await ensureStaticPageSeoRecords();

  const [pages, categories, products] = await Promise.all([
    PageSeo.find({ status: "active", robotsIndex: { $ne: false } }).lean(),
    Category.find({ status: "active" }).select("slug updatedAt").lean(),
    Product.find({ status: "active" })
      .select("slug updatedAt category seo")
      .populate("category", "slug")
      .lean(),
  ]);

  const staticEntries = pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: page.updatedAt || new Date(),
    changeFrequency: page.path === "/" ? "daily" : "weekly",
    priority: page.path === "/" ? 1 : 0.8,
  }));

  const categoryEntries = categories.map((cat) => ({
    url: `${siteUrl}/${cat.slug}`,
    lastModified: cat.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries = products
    .filter((p) => p.category?.slug && p.seo?.robotsIndex !== false)
    .map((p) => ({
      url: `${siteUrl}/${p.category.slug}/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
