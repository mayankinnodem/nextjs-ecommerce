"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);

  const productId = product?._id;
  const categorySlug = product?.categorySlug || "unknown";
  const productSlug = product?.productSlug || "product";

  const image = product?.images?.[0]?.url || "/placeholder.png";

  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  const salePrice =
    product?.salePrice || price - Math.round((price * discount) / 100);

  const handleAddToCart = () => {
    setIsAdding(true);

    // get existing cart
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");

    // check exists
    const existing = stored.find((item) => item._id === productId);

    if (existing) {
      existing.quantity += 1;
    } else {
      stored.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(stored));

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="relative border rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white">
      {/* Clickable Link */}
      <Link href={`/${categorySlug}/${productSlug}`}>
        <img
          src={image}
          alt={product?.name}
          className="w-full h-48 object-cover cursor-pointer"
        />
      </Link>

      <div className="p-4">
        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
            {product?.name}
          </h3>
        </Link>

        <p className="text-gray-600 font-semibold text-lg">
          ₹{salePrice.toLocaleString()}
        </p>

        {discount > 0 && (
          <p className="text-sm text-red-500 line-through">
            ₹{price.toLocaleString()}
          </p>
        )}

        {/* ✅ Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`mt-3 w-full py-2 rounded-md text-white font-semibold transition
          ${isAdding ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
