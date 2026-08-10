import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildStaticPageMetadata("/all-categories", {
    title: "All Categories",
    description: "Browse all product categories in our store.",
  });
}

export default function AllCategoriesLayout({ children }) {
  return children;
}
