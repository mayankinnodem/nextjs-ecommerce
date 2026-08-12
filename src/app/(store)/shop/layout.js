import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export async function generateMetadata() {
  return buildStaticPageMetadata("/shop");
}

export default function ShopLayout({ children }) {
  return (
    <>
      <PageSeoJsonLd path="/shop" />
      {children}
    </>
  );
}
