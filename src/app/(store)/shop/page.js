"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  
  const itemsPerPage = 8;

  // ✅ FETCH PRODUCTS WITH SERVER-SIDE FILTERING
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", itemsPerPage.toString());
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (priceRange !== "all") params.set("priceRange", priceRange);
      if (sort !== "default") params.set("sort", sort);

      const res = await fetch(`/api/store/products?${params.toString()}`);
      const data = await res.json();

      if (data?.success && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, priceRange, sort, itemsPerPage]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params when filters change (without page reload)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (priceRange !== "all") params.set("priceRange", priceRange);
    if (sort !== "default") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }, [search, category, priceRange, sort, page, router]);

  // Handle filter changes
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page on filter change
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          {/* Categories will be loaded separately if needed */}
        </select>

        <select
          className="border p-2 rounded"
          value={priceRange}
          onChange={(e) => handlePriceRangeChange(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="under5k">Under ₹5,000</option>
          <option value="5kTo20k">₹5,000 - ₹20,000</option>
          <option value="above20k">Above ₹20,000</option>
        </select>

        <select
          className="border p-2 rounded"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="default">Sort By</option>
          <option value="lowToHigh">Price Low → High</option>
          <option value="highToLow">Price High → Low</option>
        </select>
      </div>

      {/* ================= PRODUCT GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-xl" />
          ))
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product}
              category_slug={product?.category?.slug}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No products found
          </p>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {total > 0 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Prev
          </button>

          <span className="px-4 py-2 font-semibold">
            Page {page} of {totalPages} ({total} total)
          </span>

          <button
            disabled={page === totalPages || loading}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

    </section>
  );
}
