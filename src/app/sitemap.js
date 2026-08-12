import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import { getSiteUrl } from "@/lib/siteUrl";
import { syncAllSeoPages } from "@/lib/seoSync";

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = (await getSiteUrl()) || "http://localhost:3000";

  try {
    await connectDB();
    try {
      await syncAllSeoPages();
    } catch (syncErr) {
      // Sync is best-effort during build; still emit sitemap from existing rows
      console.error("Sitemap SEO sync warning:", syncErr.message || syncErr);
    }

    const pages = await PageSeo.find({
      status: "active",
      robotsIndex: { $ne: false },
    })
      .select("path updatedAt pageType")
      .lean();

    if (!pages?.length) {
      return [
        {
          url: siteUrl,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 1,
        },
      ];
    }

    return pages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: page.updatedAt || new Date(),
      changeFrequency:
        page.path === "/"
          ? "daily"
          : page.pageType === "product"
            ? "weekly"
            : "weekly",
      priority:
        page.path === "/"
          ? 1
          : page.pageType === "product"
            ? 0.6
            : page.pageType === "category"
              ? 0.7
              : 0.8,
    }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
