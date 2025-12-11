"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const categorySlug = product?.category?.slug || "category";
  const productSlug = product?.slug || "product";
  const image = product?.images?.[0]?.url || "/placeholder.png";
  const price = product?.salePrice || product?.price;

  // ⭐ Load wishlist state
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds")) || [];
      setIsWishlisted(ids.includes(product._id));
    } catch {
      setIsWishlisted(false);
    }
  }, [product._id]);

  const syncWishlistIds = (fn) => {
    const current = JSON.parse(localStorage.getItem("wishlistIds")) || [];
    const updated = fn(current);
    localStorage.setItem("wishlistIds", JSON.stringify(updated));
  };

  // ❤️ Wishlist
  const handleWishlistToggle = async () => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser?._id) {
      window.location.href = `/auth/login?redirect=/${categorySlug}/${productSlug}`;
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      const method = isWishlisted ? "DELETE" : "POST";
      await fetch("/api/user/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localUser._id,
          productId: product._id,
        }),
      });

      setIsWishlisted(!isWishlisted);

      syncWishlistIds((ids) =>
        isWishlisted ? ids.filter((id) => id !== product._id) : [...ids, product._id]
      );
    } catch (err) {
      console.log("Wishlist toggle error:", err);
    } finally {
      setBusy(false);
    }
  };

  // 🛒 Add to cart with best UX
const handleAddToCart = () => {
  if (adding) return;

  setAdding(true);

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exists = cart.find((item) => item._id === product._id);

  if (exists) exists.quantity += 1;
  else cart.push({
    _id: product._id,
    name: product.name,
    price,
    image,
    quantity: 1,
  });

  localStorage.setItem("cart", JSON.stringify(cart));

  // ⭐⭐⭐ Emit updated total items count (quantity based)
  const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: totalQty }));

  setTimeout(() => {
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, 1200);
};


  return (
    <div className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition relative bg-white">

      {/* ❤️ Wishlist */}
      <button
        onClick={handleWishlistToggle}
        disabled={busy}
        className="absolute top-3 right-3 bg-white shadow-md p-2 rounded-full hover:scale-110 transition z-20"
      >
        <Heart
          size={20}
          className={
            isWishlisted
              ? "text-red-500 fill-red-500"
              : "text-gray-600 group-hover:text-red-500"
          }
        />
      </button>

      <Link href={`/${categorySlug}/${productSlug}`}>
        <img
          src={image}
          alt={product?.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
        />
      </Link>

      {product?.discount > 0 && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {product.discount}% OFF
        </span>
      )}

      <div className="p-4 space-y-2">

        {/* Title */}
        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-lg font-bold text-indigo-700">₹{price}</p>

        {/* Success badge */}
        {added && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
            <CheckCircle2 size={18} />
            Added to Cart
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || added}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition 
            ${
              added
                ? "bg-green-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
        >
          {adding ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Adding...
            </>
          ) : added ? (
            <>
              <CheckCircle2 size={18} />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
