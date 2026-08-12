"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "@/context/LocaleContext";
import { categoryDisplayName } from "@/lib/i18nContent";

export default function CategoryPageClient({ products, categorySlug }) {
  const { t, language } = useLocale();
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const handleCategoryChange = (slug) => {
    if (!slug || slug === "all") {
      router.push("/shop");
      return;
    }
    if (slug !== categorySlug) {
      router.push(`/${slug}`);
    }
  };

  return (
    <section className="page-container py-8 sm:py-10">
      {categories.length > 0 && (
        <div className="mb-6 sm:mb-8 max-w-md">
          <select
            value={categorySlug || "all"}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-field"
            aria-label={t("shop.allCategories")}
          >
            <option value="all">{t("shop.allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {categoryDisplayName(cat, language)}
              </option>
            ))}
          </select>
        </div>
      )}

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
