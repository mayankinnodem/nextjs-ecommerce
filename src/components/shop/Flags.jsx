"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

export default function Flags() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ✅ Fetch categories */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/store/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  /* ✅ Fetch Products */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/store/products");
        const data = await res.json();

        if (data.success) {
          const updatedProducts = data.products.map((p) => {
            const cat =
              categories.find(
                (c) => c._id === p.category || c._id === p?.category?._id
              ) || {};

            return {
              ...p,
              categorySlug: cat?.slug ?? "unknown",
              productSlug: p?.slug ?? "product",
              categoryName: cat?.name ?? "",
            };
          });

          setAllProducts(updatedProducts);
          setTrending(updatedProducts.filter((p) => p.isTrending));
          setFeatured(updatedProducts.filter((p) => p.isFeatured));
          setNewArrivals(updatedProducts.filter((p) => p.isNewArrival));
        }
      } catch (err) {
        console.error("Failed to fetch products for flags:", err);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length) fetchProducts();
  }, [categories]);

  const renderFlagSection = (title, products) => (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="border rounded-lg p-4 animate-pulse bg-white h-72"></div>
            ))
          : products.length > 0
          ? products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={(p) => console.log("Add to cart:", p)}
              />
            ))
          : (
            <p className="col-span-full text-center text-gray-500">
              No products found!
            </p>
          )}
      </div>
    </section>
  );

  return (
    <>
      {renderFlagSection("Trending Products", trending)}
      {renderFlagSection("Featured Products", featured)}
      {renderFlagSection("New Arrivals", newArrivals)}
    </>
  );
}
