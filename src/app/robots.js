import { getSiteUrl } from "@/lib/siteUrl";
import { getGlobalSeoSettings } from "@/lib/seo";

export default async function robots() {
  const siteUrl = await getSiteUrl();
  await getGlobalSeoSettings();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin-dashboard/",
        "/user-dashboard/",
        "/api/",
        "/checkout",
        "/cart",
        "/login",
        "/delete-account",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
