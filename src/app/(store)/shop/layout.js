import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export async function generateMetadata() {
  return buildStaticPageMetadata("/shop", {
    title: "Shop",
    description: "Browse our full product catalog with filters and search.",
  });
}

export default function ShopLayout({ children }) {
  return (
    <>
      <PageSeoJsonLd path="/shop" />
      {children}
    </>
  );
}
