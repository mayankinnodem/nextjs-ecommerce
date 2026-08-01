"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
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
      <section className="section-block bg-gray-50">
        <div className="page-container">
          <div className="section-header-center">
            <div className="skeleton h-10 w-64 mx-auto mb-3" />
            <div className="skeleton h-4 w-96 max-w-full mx-auto" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton shrink-0 w-64 h-80 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-block bg-gray-50">
      <div className="page-container">
        <div className="section-header-center">
          <h2 className="section-title">{t("categories.title")}</h2>
          <p className="section-subtitle">{t("categories.subtitle")}</p>
        </div>

        <div className="scroll-fade-x relative" style={{ "--fade-color": "#f9fafb" }}>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-1 -mx-1">
            {categories.map((cat) => {
              const displayName = categoryDisplayName(cat, language);
              return (
                <Link
                  key={cat?._id || cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="snap-start shrink-0 first:ml-0"
                >
                  <div className="card w-56 sm:w-64 md:w-72 p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
                    <div className="flex justify-center">
                      {cat?.image?.url ? (
                        <img
                          src={cat.image.url}
                          alt={displayName}
                          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-indigo-50 bg-gray-100 group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                          {displayName?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h3 className="mt-5 text-center text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                      {displayName}
                    </h3>

                    <p className="mt-2 text-center text-sm text-indigo-600 font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                      {t("categories.explore")}
                      <ChevronRight size={16} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
