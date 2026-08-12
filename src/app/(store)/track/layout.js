import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/track");
}

export default function TrackLayout({ children }) {
  return children;
}
