import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export async function generateMetadata() {
  return buildStaticPageMetadata("/delete-account");
}

export default function DeleteAccountLayout({ children }) {
  return (
    <>
      <PageSeoJsonLd path="/delete-account" />
      {children}
    </>
  );
}
