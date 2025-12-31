"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/store/categories");
        const data = await res.json();
        if (data?.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-24 text-gray-500 text-lg">
        Loading categories...
      </p>
    );
  }

  return (
    <section className="bg-gray-50 py-16 px-6">
      {/* ================= HEADING ================= */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Shop by Category
        </h1>
        <p className="mt-3 text-gray-600 text-lg">
          Find products faster by browsing popular categories
        </p>
      </div>

      {/* ================= SLIDER ================= */}
      <div className="max-w-7xl mx-auto relative">
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">

          {categories.map((cat) => (
            <Link
              key={cat?._id || cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="snap-start shrink-0"
            >
              <div className="w-72 md:w-80 bg-white rounded-[32px] p-8 border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer">

                {/* IMAGE */}
                <div className="flex justify-center">
                  {cat?.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      className="w-36 h-36 object-cover rounded-full border bg-gray-100"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                      {cat?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* NAME */}
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                  {cat.name}
                </h2>

                {/* CTA */}
                <p className="mt-2 text-center text-sm text-gray-500">
                  Explore products →
                </p>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
