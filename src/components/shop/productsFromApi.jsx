"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";

const ProductsFromApi = ({ categorySlug }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  /* ✅ Fetch Categories */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/store/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
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

        if (data.success && data.products?.length) {
          const updatedProducts = data.products.map((p) => {
            const cat = categories.find(
              (c) => c._id === p.category || c._id === p?.category?._id
            );

            return {
              ...p,
              categorySlug: cat?.slug ?? "unknown",
              productSlug: p?.slug ?? "product",
              categoryName: cat?.name ?? "",
            };
          });

          setProducts(updatedProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (!loadingCategories) fetchProducts();
  }, [loadingCategories, categories]);

  /* ✅ URL FILTER */
  useEffect(() => {
    if (categorySlug) {
      setCategory(categorySlug); // URL se category set
      setPage(1);
    }
  }, [categorySlug]);

  /* ✅ Filter + Sort */
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (categorySlug) {
      filtered = filtered.filter((p) => p.categorySlug === categorySlug);
    }

    // extra filter user choice se (optional)
    if (category !== "All") {
      filtered = filtered.filter((p) => p.categorySlug === category);
    }

    if (priceRange !== "All") {
      if (priceRange === "under5k") filtered = filtered.filter((p) => p.price < 5000);
      if (priceRange === "5kTo20k")
        filtered = filtered.filter((p) => p.price >= 5000 && p.price <= 20000);
      if (priceRange === "above20k") filtered = filtered.filter((p) => p.price > 20000);
    }

    if (sort === "lowToHigh") filtered.sort((a, b) => a.price - b.price);
    if (sort === "highToLow") filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, categorySlug, category, priceRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentItems = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        {categorySlug ? categorySlug.replace(/-/g, " ") : "All Products"}
      </h2>

      {/* ✅ Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loadingProducts ? (
          Array.from({ length: itemsPerPage }).map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 animate-pulse bg-white h-72" />
          ))
        ) : currentItems.length > 0 ? (
          currentItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No products found!
          </p>
        )}
      </div>
    </section>
  );
};

export default ProductsFromApi;
