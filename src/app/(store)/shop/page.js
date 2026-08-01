"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "@/context/LocaleContext";
import { categoryDisplayName } from "@/lib/i18nContent";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatPrice, language } = useLocale();

  /* ---------- STATES ---------- */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState(
    searchParams.get("priceRange") || "all"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  const itemsPerPage = 8;

  /* ===================== FETCH CATEGORIES ===================== */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/store/categories");
      const data = await res.json();

      if (data?.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  }, []);

  /* ===================== FETCH PRODUCTS ===================== */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", itemsPerPage.toString());

      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (priceRange !== "all") params.set("priceRange", priceRange);
      if (sort !== "default") params.set("sort", sort);

      const res = await fetch(
        `/api/store/products?${params.toString()}`
      );
      const data = await res.json();

      if (data?.success) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error) {
      console.error("Product fetch error:", error);
      setProducts([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, priceRange, sort]);

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync URL (no reload)
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (priceRange !== "all") params.set("priceRange", priceRange);
    if (sort !== "default") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());

    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }, [search, category, priceRange, sort, page, router]);

  /* ===================== HANDLERS ===================== */
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setPriceRange("all");
    setSort("default");
    setPage(1);
  };

  /* ===================== UI ===================== */
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-8 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* SEARCH */}
          <input
            type="text"
            placeholder={t("shop.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("shop.allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {categoryDisplayName(cat, language)}
              </option>
            ))}
          </select>

          {/* PRICE */}
          <select
            value={priceRange}
            onChange={(e) => {
              setPriceRange(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("shop.allPrices")}</option>
            <option value="under5k">{t("shop.under5k", { amount: formatPrice(5000) })}</option>
            <option value="5kTo20k">{t("shop.5kTo20k", { low: formatPrice(5000), high: formatPrice(20000) })}</option>
            <option value="above20k">{t("shop.above20k", { amount: formatPrice(20000) })}</option>
          </select>

          {/* SORT */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">{t("shop.sortBy")}</option>
            <option value="lowToHigh">{t("shop.priceLowHigh")}</option>
            <option value="highToLow">{t("shop.priceHighLow")}</option>
          </select>
        </div>

        {/* INFO + RESET */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {t("shop.showing", { count: products.length, total })}
          </span>

          <button
            onClick={resetFilters}
            className="text-indigo-600 hover:underline"
          >
            {t("shop.resetFilters")}
          </button>
        </div>
      </div>

      {/* ================= PRODUCT GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 animate-pulse rounded-xl"
            />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category_slug={product?.category?.slug}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {t("products.noProducts")}
          </p>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {total > 0 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            {t("shop.prev")}
          </button>

          <span className="font-semibold">
            {t("shop.page", { page, total: totalPages })}
          </span>

          <button
            disabled={page === totalPages || loading}
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            {t("shop.next")}
          </button>
        </div>
      )}
    </section>
  );
}

/* ===================== SUSPENSE WRAPPER ===================== */

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </section>
      }
    >
      <ShopContent />
    </Suspense>
  );
}