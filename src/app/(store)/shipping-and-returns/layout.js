import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/shipping-and-returns", {
    title: "Shipping & Returns",
    description: "Shipping policies, delivery times and return information.",
  });
}

export default function ShippingLayout({ children }) {
  return children;
}
