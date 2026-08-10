import React from "react";
import Link from "next/link";
import ProductActions from "./ProductActions";
import ProductGallery from "@/components/shop/ProductGallery";
import SuggestedProducts from "@/components/shop/SuggestedProducts";
import { getProductBySlugs, getAllProducts, getAllCategories } from "@/lib/staticData";
import { buildProductMetadata } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/PageSeoJsonLd";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  const products = await getAllProducts();

  const params = [];

  for (const product of products) {
    const category = categories.find(
      (cat) =>
        cat._id.toString() === product.category?._id?.toString() ||
        cat._id.toString() === product.category?.toString()
    );

    if (category && product.slug) {
      params.push({
        category_slug: category.slug,
        product_slug: product.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }) {
  const { category_slug, product_slug } = await params;
  const { product } = await getProductBySlugs(category_slug, product_slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return buildProductMetadata(product, category_slug, product_slug);
}

export default async function ProductPage({ params }) {
  const { category_slug, product_slug } = await params;
  const { product } = await getProductBySlugs(category_slug, product_slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <JsonLdScript data={product.seo?.structuredData} />
      <div className="page-container py-6 sm:py-10 pb-float md:pb-10">
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 transition">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-indigo-600 transition">
          Shop
        </Link>
        <ChevronRight size={14} />
        <Link
          href={`/${category_slug}`}
          className="hover:text-indigo-600 transition capitalize"
        >
          {product.category?.name || category_slug}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images || []} name={product.name} />

        <div className="space-y-4">
          {product.brand?.name && (
            <p className="text-sm text-indigo-600 font-medium uppercase tracking-wide">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}
          <ProductActions product={product} />
        </div>
      </div>

      <SuggestedProducts
        categorySlug={product.category?.slug}
        currentProductId={product._id}
      />
    </div>
    </>
  );
}
