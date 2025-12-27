"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  CheckCircle2,
  Loader2,
  Flame,
  Sparkles,
} from "lucide-react";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const categorySlug = product?.category?.slug || "category";
  const productSlug = product?.slug || "product";

  const image = product?.images?.[0]?.url || "/placeholder.png";
  const price = product?.salePrice || product?.price;
  const mrp = product?.price;
  const discount = product?.discount || 0;

  const stock = product?.stock || 0;
  const lowStock = stock > 0 && stock <= 5;

  // ⭐ Wishlist state
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
    localStorage.setItem("wishlistIds", JSON.stringify(fn(current)));
  };

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
      console.log("Wishlist error:", err);
    } finally {
      setBusy(false);
    }
  };

  // 🛒 Add to cart
  const handleAddToCart = () => {
    if (adding || stock === 0) return;
    setAdding(true);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find((i) => i._id === product._id);

    if (exists) exists.quantity += 1;
    else {
      cart.push({
        _id: product._id,
        name: product.name,
        price,
        image,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", {
        detail: cart.reduce((a, i) => a + i.quantity, 0),
      })
    );

    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }, 1000);
  };

  return (
    <div className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition relative">


      {/* ❤️ Wishlist */}
      <button
        onClick={handleWishlistToggle}
        disabled={busy}
        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow z-20"
      >
        <Heart
          size={18}
          className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}
        />
      </button>

      {/* 🔖 Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
        {product?.isTrending && (
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Flame size={12} /> Trending
          </span>
        )}
        {product?.isNewArrival && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Sparkles size={12} /> New
          </span>
        )}
      </div>

      {/* Image */}
      <Link href={`/${categorySlug}/${productSlug}`}>
        <img
          src={image}
          alt={product?.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition"
        />
      </Link>

      <div className="p-4 space-y-2">

        {/* Brand + Gender */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{product?.brand?.name}</span>
          <span>{product?.gender}</span>
        </div>

        {/* Title */}
        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-700">₹{price}</span>
          {discount > 0 && (
            <span className="text-sm line-through text-gray-400">₹{mrp}</span>
          )}
        </div>

        {/* Attributes Preview */}
        {product?.attributes?.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs">
            {product.attributes.slice(0, 3).map((attr, i) => (
              <span
                key={i}
                className="border px-2 py-0.5 rounded text-gray-600"
              >
                {attr.value}
              </span>
            ))}
          </div>
        )}

        {/* Stock Info */}
        {stock === 0 ? (
          <p className="text-red-500 text-sm font-semibold">Out of Stock</p>
        ) : lowStock ? (
          <p className="text-orange-500 text-sm font-semibold">
            Only {stock} left
          </p>
        ) : (
          <p className="text-green-600 text-sm">In Stock</p>
        )}

        {/* Added Badge */}
        {added && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
            <CheckCircle2 size={16} /> Added to Cart
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || added || stock === 0}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition 
            ${
              stock === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : added
                ? "bg-green-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
        >
          {adding ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Adding...
            </>
          ) : added ? (
            <>
              <CheckCircle2 size={18} /> Added
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
