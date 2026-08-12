import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/all-categories");
}

export default function AllCategoriesLayout({ children }) {
  return children;
}
