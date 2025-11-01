"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories");
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

  if (loading) return <p className="text-center mt-20">Loading categories...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 py-12 px-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
        Explore Categories
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="relative p-6 rounded-3xl shadow-2xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:scale-105 bg-white"
          >
            {cat.image?.url ? (
              <img
                src={cat.image.url}
                alt={cat.name}
                className="w-20 h-20 mx-auto object-cover rounded-full"
              />
            ) : (
              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                {cat.name[0].toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-xl font-semibold text-gray-800 text-center">{cat.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
