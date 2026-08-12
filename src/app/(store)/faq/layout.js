import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/faq");
}

export default function FaqLayout({ children }) {
  return children;
}
