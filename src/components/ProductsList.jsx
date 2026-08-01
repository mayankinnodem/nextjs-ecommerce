"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { useLocale } from "@/context/LocaleContext";

export default function ProductsList({ limit = 8, titleKey = "products.featured" }) {
  const { t } = useLocale();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = t(titleKey);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/store/products?limit=${limit}`, {
          cache: "force-cache",
          next: { revalidate: 300 },
        });

        if (!res.ok) {
          setProducts([]);
          return;
        }

        const data = await res.json();
        if (data?.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 section-header">
      <div>
        <h2 className="section-title">{title}</h2>
      </div>
      <Link
        href="/shop"
        className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition shrink-0"
      >
        {t("products.viewAll")}
      </Link>
    </div>
  );

  if (loading) {
    return (
      <section className="section-block bg-white">
        <div className="page-container">
          {header}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="section-block bg-white">
        <div className="page-container">
          {header}
          <p className="text-center text-gray-500 py-8">{t("products.noProducts")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-block bg-white">
      <div className="page-container">
        {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category_slug={product?.category?.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
