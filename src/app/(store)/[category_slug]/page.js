import CategoryPageClient from "@/components/CategoryPageClient";
import CategoryHero from "@/components/CategoryHero";
import { JsonLdScript } from "@/components/seo/PageSeoJsonLd";
import { getProductsByCategory, getAllCategories } from "@/lib/staticData";
import { buildCategoryMetadata, getResolvedStructuredData } from "@/lib/seo";
import { serializeForClient } from "@/lib/serializeMongo";
import { notFound } from "next/navigation";

// ISR: Revalidate every 60 seconds (1 minute)
export const revalidate = 60;
export const dynamicParams = true;

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
  const { category } = await getProductsByCategory(category_slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return buildCategoryMetadata(category, category_slug);
}

export default async function CategoryPage({ params }) {
  const { category_slug } = await params;
  const { category, products } = await getProductsByCategory(category_slug);

  // If category not found, show 404
  if (!category) {
    notFound();
  }

  const structuredData = await getResolvedStructuredData(
    `/${category_slug}`,
    category.seo
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLdScript data={structuredData} />
      <CategoryHero category={category} />
      <CategoryPageClient
        products={serializeForClient(products)}
        categorySlug={category.slug}
      />
    </div>
  );
}
