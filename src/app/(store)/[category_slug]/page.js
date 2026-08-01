import CategoryPageClient from "@/components/CategoryPageClient";
import { getProductsByCategory, getAllCategories, getContactSection } from "@/lib/staticData";
import { getSiteMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

// ISR: Revalidate every 60 seconds (1 minute)
export const revalidate = 60;

// Generate static params for all categories at build time
export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.map((category) => ({
    category_slug: category.slug,
  }));
}

// Generate metadata for SEO - site name from API
export async function generateMetadata({ params }) {
  const { category_slug } = await params;
  const contact = await getContactSection();
  const siteName = contact.siteName;
  const { category } = await getProductsByCategory(category_slug);
  
  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const pageTitle = `${category.name} - ${siteName}`;
  const description =
    category.description || `Browse ${category.name} products at ${siteName}`;

  return getSiteMetadata({
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description: category.description || `Browse ${category.name} products`,
      images: category.image?.url ? [category.image.url] : [],
    },
  });
}

export default async function CategoryPage({ params }) {
  const { category_slug } = await params;
  const { category, products } = await getProductsByCategory(category_slug);

  // If category not found, show 404
  if (!category) {
    notFound();
  }

  return <CategoryPageClient category={category} products={products} />;
}
