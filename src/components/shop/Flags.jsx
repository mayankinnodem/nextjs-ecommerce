"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useLocale } from "@/context/LocaleContext";

export default function Flags() {
  const { t } = useLocale();
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/store/products?limit=24", {
          cache: "force-cache",
          next: { revalidate: 300 },
        });

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        const allProducts = data?.products || [];

        const trendingProducts = allProducts.filter((p) => p.isTrending).slice(0, 8);
        const newArrivalProducts = allProducts.filter((p) => p.isNewArrival).slice(0, 8);

        setTrending(
          trendingProducts.length > 0 ? trendingProducts : allProducts.slice(0, 8)
        );
        setNewArrivals(
          newArrivalProducts.length > 0 ? newArrivalProducts : allProducts.slice(8, 16)
        );
      } catch (err) {
        console.error("Failed to fetch products for flags:", err);
        setTrending([]);
        setNewArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderFlagSection = (title, products, bgClass = "bg-gray-50") => (
    <section className={`section-block ${bgClass}`}>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 section-header">
          <h2 className="section-title">{title}</h2>
          <Link
            href="/shop"
            className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition shrink-0"
          >
            {t("products.viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton h-72 sm:h-80 rounded-2xl" />
              ))
            : products.length > 0
            ? products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            : (
              <p className="col-span-full text-center text-gray-500 py-8">
                {t("products.noProducts")}
              </p>
            )}
        </div>
      </div>
    </section>
  );

  return (
    <>
      {renderFlagSection(t("products.trending"), trending, "bg-gray-50")}
      {renderFlagSection(t("products.newArrivals"), newArrivals, "bg-white")}
    </>
  );
}
