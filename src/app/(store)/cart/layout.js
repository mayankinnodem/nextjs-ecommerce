import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/cart", {
    title: "Shopping Cart",
    description: "Review items in your cart before checkout.",
  });
}

export default function CartLayout({ children }) {
  return children;
}
