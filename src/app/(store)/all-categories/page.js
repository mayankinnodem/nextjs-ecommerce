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
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-24 text-gray-500 text-lg">
        Loading categories...
      </p>
    );

  return (
    <div className="bg-gray-50 py-12 px-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Explore Categories
      </h1>

      {/* 🔥 SLIDER */}
      <div className="relative">
       <div className="flex gap-6 overflow-x-auto pb-5 snap-x snap-mandatory scrollbar-hide">
  {categories.map((cat) => (
    <Link
      key={cat?._id || cat.slug}
      href={cat.slug}
      className="snap-start shrink-0"
    >
      <div className="w-56 bg-white border border-gray-100 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

        {/* IMAGE */}
        <div className="flex justify-center">
          {cat?.image?.url ? (
            <img
              src={cat.image.url}
              alt={cat.name}
              className="w-24 h-24 object-cover rounded-full border bg-gray-50"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-600">
              {cat?.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* NAME */}
        <h2 className="mt-5 text-center text-lg font-semibold text-gray-800 hover:text-indigo-600 transition">
          {cat.name}
        </h2>
      </div>
    </Link>
  ))}
</div>

      </div>
    </div>
  );
}
