import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/faq", {
    title: "FAQ",
    description: "Frequently asked questions about orders, shipping and returns.",
  });
}

export default function FaqLayout({ children }) {
  return children;
}
