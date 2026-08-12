import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/cart");
}

export default function CartLayout({ children }) {
  return children;
}
