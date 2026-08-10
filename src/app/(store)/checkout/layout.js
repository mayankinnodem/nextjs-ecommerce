import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/checkout", {
    title: "Checkout",
    description: "Complete your order securely.",
  });
}

export default function CheckoutLayout({ children }) {
  return children;
}
