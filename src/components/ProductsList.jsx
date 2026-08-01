"use client";

import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{title}</h2>
        <p className="text-center text-gray-500">{t("products.noProducts")}</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            category_slug={product?.category?.slug}
          />
        ))}
      </div>
    </section>
  );
}
