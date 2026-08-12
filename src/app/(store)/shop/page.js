"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "@/context/LocaleContext";
import { categoryDisplayName } from "@/lib/i18nContent";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatPrice, language } = useLocale();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState(
    searchParams.get("priceRange") || "all"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  const itemsPerPage = 8;
  const legacyCategory = searchParams.get("category");
  const isRedirectingCategory =
    Boolean(legacyCategory) && legacyCategory !== "all";

  // Legacy /shop?category=slug → /{slug}
  useEffect(() => {
    if (isRedirectingCategory) {
      router.replace(`/${legacyCategory}`);
    }
  }, [isRedirectingCategory, legacyCategory, router]);

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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", itemsPerPage.toString());

      if (search) params.set("search", search);
      if (priceRange !== "all") params.set("priceRange", priceRange);
      if (sort !== "default") params.set("sort", sort);

      const res = await fetch(`/api/store/products?${params.toString()}`);
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
  }, [page, search, priceRange, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isRedirectingCategory) return;
    fetchProducts();
  }, [fetchProducts, isRedirectingCategory]);

  useEffect(() => {
    if (isRedirectingCategory) return;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (priceRange !== "all") params.set("priceRange", priceRange);
    if (sort !== "default") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  }, [search, priceRange, sort, page, router, isRedirectingCategory]);

  const resetFilters = () => {
    setSearch("");
    setPriceRange("all");
    setSort("default");
    setPage(1);
  };

  const handleCategoryChange = (slug) => {
    if (!slug || slug === "all") return;
    router.push(`/${slug}`);
  };

  const activeFilters =
    (search ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (sort !== "default" ? 1 : 0);

  if (isRedirectingCategory) {
    return (
      <div className="page-container py-10">
        <div className="skeleton h-32 rounded-2xl mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-72 sm:h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="page-container py-8 sm:py-14">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t("shop.title")}
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-lg max-w-xl">
            {t("shop.subtitle")}
          </p>
        </div>
      </div>

      <section className="page-container py-8 sm:py-10">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden w-full card px-4 py-3 flex items-center justify-between mb-4 font-semibold text-gray-800"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-indigo-600" />
            {t("shop.filters")}
            {activeFilters > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`transition ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`card p-4 sm:p-5 mb-8 space-y-4 ${
            filtersOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder={t("shop.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field"
            />

            <select
              value="all"
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field"
            >
              <option value="all">{t("shop.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {categoryDisplayName(cat, language)}
                </option>
              ))}
            </select>

            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="all">{t("shop.allPrices")}</option>
              <option value="under5k">
                {t("shop.under5k", { amount: formatPrice(5000) })}
              </option>
              <option value="5kTo20k">
                {t("shop.5kTo20k", {
                  low: formatPrice(5000),
                  high: formatPrice(20000),
                })}
              </option>
              <option value="above20k">
                {t("shop.above20k", { amount: formatPrice(20000) })}
              </option>
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="default">{t("shop.sortBy")}</option>
              <option value="lowToHigh">{t("shop.priceLowHigh")}</option>
              <option value="highToLow">{t("shop.priceHighLow")}</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600 pt-1">
            <span>{t("shop.showing", { count: products.length, total })}</span>
            <button
              onClick={resetFilters}
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition text-left sm:text-right"
            >
              {t("shop.resetFilters")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {loading
            ? Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className="skeleton h-72 sm:h-80 rounded-2xl" />
              ))
            : products.length > 0
            ? products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  category_slug={product?.category?.slug}
                />
              ))
            : (
              <div className="col-span-full card text-center py-16 px-6">
                <p className="text-gray-500 text-lg">{t("products.noProducts")}</p>
                <button onClick={resetFilters} className="btn-primary mt-4 px-6 py-2.5">
                  {t("shop.resetFilters")}
                </button>
              </div>
            )}
        </div>

        {total > 0 && (
          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-10 flex-wrap">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary px-4 py-2 disabled:opacity-40"
            >
              {t("shop.prev")}
            </button>

            <span className="font-semibold text-sm sm:text-base px-2">
              {t("shop.page", { page, total: totalPages })}
            </span>

            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn-secondary px-4 py-2 disabled:opacity-40"
            >
              {t("shop.next")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-10">
          <div className="skeleton h-32 rounded-2xl mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-72 sm:h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
