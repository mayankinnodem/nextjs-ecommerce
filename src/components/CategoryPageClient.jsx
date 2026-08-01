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
    <section className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold">{name}</h1>

      {description && <p className="text-gray-600 mt-2">{description}</p>}

      {products.length === 0 ? (
        <p className="mt-10 text-gray-500">{t("categories.noProductsInCategory")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
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
  );
}
