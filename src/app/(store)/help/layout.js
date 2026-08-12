import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/help");
}

export default function HelpLayout({ children }) {
  return children;
}
