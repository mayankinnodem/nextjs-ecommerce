import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/track", {
    title: "Track Order",
    description: "Track your order status and delivery progress.",
  });
}

export default function TrackLayout({ children }) {
  return children;
}
