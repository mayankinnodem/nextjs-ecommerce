import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export async function generateMetadata() {
  return buildStaticPageMetadata("/login");
}

export default function LoginLayout({ children }) {
  return (
    <>
      <PageSeoJsonLd path="/login" />
      {children}
    </>
  );
}
