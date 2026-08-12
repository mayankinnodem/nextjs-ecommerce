import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/checkout");
}

export default function CheckoutLayout({ children }) {
  return children;
}
