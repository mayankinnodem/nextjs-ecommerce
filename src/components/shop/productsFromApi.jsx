"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";

const ProductsFromApi = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Filters & Sorting
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sort, setSort] = useState("default");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch categories from API
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/store/products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
        else console.error("Failed to fetch products:", data.error);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter + Sort
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Price filter
    if (priceRange !== "All") {
      if (priceRange === "under5k") filtered = filtered.filter(p => p.price < 5000);
      if (priceRange === "5kTo20k") filtered = filtered.filter(p => p.price >= 5000 && p.price <= 20000);
      if (priceRange === "above20k") filtered = filtered.filter(p => p.price > 20000);
    }

    // Sorting
    if (sort === "lowToHigh") filtered.sort((a, b) => a.price - b.price);
    if (sort === "highToLow") filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, category, priceRange, sort]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentItems = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">All Products</h2>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full font-medium ${category === "All" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"} transition`}
          onClick={() => { setCategory("All"); setPage(1); }}
        >
          All
        </button>
        {!loadingCategories &&
          categories.map((cat) => (
            <button
              key={cat._id}
              className={`px-4 py-2 rounded-full font-medium ${category === cat.name ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"} transition`}
              onClick={() => { setCategory(cat.name); setPage(1); }}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Price & Sort Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 text-gray-700">
        <select
          value={priceRange}
          onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Prices</option>
          <option value="under5k">Under ₹5,000</option>
          <option value="5kTo20k">₹5,000 - ₹20,000</option>
          <option value="above20k">Above ₹20,000</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border px-3 py-2 rounded">
          <option value="default">Default</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loadingProducts
          ? Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div key={idx} className="border rounded-lg p-4 animate-pulse bg-white h-72"></div>
            ))
          : currentItems.length > 0
          ? currentItems.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={(p) => console.log("Add to cart:", p)} />
            ))
          : <p className="col-span-full text-center text-gray-500">No products found!</p>
        }
      </div>

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductsFromApi;
