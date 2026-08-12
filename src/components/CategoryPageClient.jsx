"use client";

import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "@/context/LocaleContext";

export default function CategoryPageClient({ products, categorySlug }) {
  const { t } = useLocale();

  return (
    <section className="page-container py-8 sm:py-10">
      {products.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <p className="text-gray-500 text-lg">{t("categories.noProductsInCategory")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category_slug={product?.category?.slug || categorySlug}
            />
          ))}
        </div>
      )}
    </section>
  );
}
