import { buildStaticPageMetadata } from "@/lib/seo";
import PageSeoJsonLd from "@/components/seo/PageSeoJsonLd";

export async function generateMetadata() {
  return buildStaticPageMetadata("/delete-account", {
    title: "Delete Account",
    description: "Request account deletion",
  });
}

export default function DeleteAccountLayout({ children }) {
  return (
    <>
      <PageSeoJsonLd path="/delete-account" />
      {children}
    </>
  );
}
