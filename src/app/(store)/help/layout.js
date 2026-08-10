import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/help", {
    title: "Help & Support",
    description: "Get help with orders, shipping, returns and account support.",
  });
}

export default function HelpLayout({ children }) {
  return children;
}
