import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import { getSiteUrl } from "@/lib/siteUrl";
import { syncAllSeoPages } from "@/lib/seoSync";

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = await getSiteUrl();
  await connectDB();
  await syncAllSeoPages();

  const pages = await PageSeo.find({
    status: "active",
    robotsIndex: { $ne: false },
  })
    .select("path updatedAt pageType")
    .lean();

  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: page.updatedAt || new Date(),
    changeFrequency:
      page.path === "/" ? "daily" : page.pageType === "product" ? "weekly" : "weekly",
    priority:
      page.path === "/"
        ? 1
        : page.pageType === "product"
          ? 0.6
          : page.pageType === "category"
            ? 0.7
            : 0.8,
  }));
}
