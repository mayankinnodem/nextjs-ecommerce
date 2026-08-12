import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/shipping-and-returns");
}

export default function ShippingLayout({ children }) {
  return children;
}
