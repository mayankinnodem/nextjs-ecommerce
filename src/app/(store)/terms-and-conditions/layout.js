import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/terms-and-conditions");
}

export default function TermsLayout({ children }) {
  return children;
}
