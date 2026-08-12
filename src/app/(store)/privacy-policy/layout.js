import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/privacy-policy");
}

export default function PrivacyLayout({ children }) {
  return children;
}
