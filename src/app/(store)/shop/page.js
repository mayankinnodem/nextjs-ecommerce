"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("default");

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ FETCH PRODUCTS SAFELY
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/store/products");
        const data = await res.json();

        if (data?.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ ALWAYS SAFE ARRAY
  const safeProducts = Array.isArray(products) ? products : [];

  // ✅ FILTER + SORT LOGIC
const filteredProducts = useMemo(() => {
  let result = [...safeProducts];

  result = result.filter((product) => {
    const price = Number(product?.price || 0);

    const matchesSearch = product?.name
      ?.toLowerCase()
      ?.includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || product?.category?.slug === category;

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "under5k" && price < 5000) ||
      (priceRange === "5kTo20k" && price >= 5000 && price <= 20000) ||
      (priceRange === "above20k" && price > 20000);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (sort === "lowToHigh") result.sort((a, b) => a.price - b.price);
  if (sort === "highToLow") result.sort((a, b) => b.price - a.price);

  return result;
}, [safeProducts, search, category, priceRange, sort]);


  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
  className="border p-2 rounded"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="all">All Categories</option>
  {[...new Set(safeProducts.map(p => p?.category?.slug))]
    .filter(Boolean)
    .map(cat => (
      <option key={cat} value={cat}>{cat}</option>
  ))}
</select>


        <select
          className="border p-2 rounded"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="under5k">Under ₹5,000</option>
          <option value="5kTo20k">₹5,000 - ₹20,000</option>
          <option value="above20k">Above ₹20,000</option>
        </select>

        <select
          className="border p-2 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
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
        ) : currentProducts.length > 0 ? (
          currentProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No products found
          </p>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center mt-8 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 font-semibold">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>

    </section>
  );
}
