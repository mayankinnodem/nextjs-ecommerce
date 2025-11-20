"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const productId = product?._id;
  const categorySlug = product?.categorySlug || "unknown";
  const productSlug = product?.productSlug || "product";

  const image = product?.images?.[0]?.url || "/placeholder.png";

  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  const salePrice = product?.salePrice || price - Math.round((price * discount) / 100);

  const handleAddToCart = () => {
    setIsAdding(true);

    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = stored.find((item) => item._id === productId);

    if (existing) existing.quantity += 1;
    else stored.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(stored));

    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <Link href={`/${categorySlug}/${productSlug}`}>
          <img
            src={image}
            alt={product?.name}
            className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-300"
          />
        </Link>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {discount}% OFF
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:scale-110 transition"
        >
          <Heart className={`w-5 h-5 ${wishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition">
            {product?.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">₹{salePrice.toLocaleString()}</span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">₹{price.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all
          ${
            isAdding
              ? "bg-gray-300 text-gray-600"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}