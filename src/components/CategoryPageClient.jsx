"use client";

import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "@/context/LocaleContext";
import {
  categoryDescription,
  categoryDisplayName,
} from "@/lib/i18nContent";

export default function CategoryPageClient({ category, products }) {
  const { t, language } = useLocale();
  const name = categoryDisplayName(category, language);
  const description = categoryDescription(category, language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="page-container py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{name}</h1>
          {description && (
            <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      <section className="page-container py-8 sm:py-10">
        {products.length === 0 ? (
          <div className="card text-center py-16 px-6">
            <p className="text-gray-500 text-lg">{t("categories.noProductsInCategory")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                category_slug={product?.category?.slug}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
