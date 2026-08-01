"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { categoryDisplayName } from "@/lib/i18nContent";

export default function CategoriesPage() {
  const { t, language } = useLocale();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setCategories(data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-24 text-gray-500 text-lg">
        {t("categories.loading")}
      </p>
    );
  }

  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          {t("categories.title")}
        </h1>
        <p className="mt-3 text-gray-600 text-lg">{t("categories.subtitle")}</p>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
          {categories.map((cat) => {
            const displayName = categoryDisplayName(cat, language);
            return (
            <Link
              key={cat?._id || cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="snap-start shrink-0"
            >
              <div className="w-72 md:w-80 bg-white rounded-[32px] p-8 border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                <div className="flex justify-center">
                  {cat?.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={displayName}
                      className="w-36 h-36 object-cover rounded-full border bg-gray-100"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                      {displayName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                  {displayName}
                </h2>

                <p className="mt-2 text-center text-sm text-gray-500">
                  {t("categories.explore")}
                </p>
              </div>
            </Link>
          );
          })}
        </div>
      </div>
    </section>
  );
}
