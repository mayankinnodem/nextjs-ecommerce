"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Heart, CheckCircle2, Loader2 } from "lucide-react";

export default function ProductActions({ product }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wish, setWish] = useState(false);
  const [busy, setBusy] = useState(false);

  const price = product.salePrice || product.price;
  const image = product.images?.[0]?.url;

  // ⭐ Load wishlist state on mount
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("wishlistIds")) || [];
    setWish(ids.includes(product._id));
  }, [product._id]);

  // ⭐ Sync wishlistIds helper
  const syncWishlistIds = (fn) => {
    const old = JSON.parse(localStorage.getItem("wishlistIds")) || [];
    const updated = fn(old);
    localStorage.setItem("wishlistIds", JSON.stringify(updated));
  };

  // ❤️ Wishlist Toggle
  const toggleWish = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) {
      window.location.href = `/auth/login?redirect=/${product.category.slug}/${product.slug}`;
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      const method = wish ? "DELETE" : "POST";

      await fetch("/api/user/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          productId: product._id,
        }),
      });

      // Local toggle
      setWish(!wish);

      syncWishlistIds((ids) =>
        wish ? ids.filter((id) => id !== product._id) : [...ids, product._id]
      );
    } catch (err) {
      console.log("Wishlist Error:", err);
    }

    setBusy(false);
  };

  // 🛒 Add to cart
  const addToCart = () => {
    if (adding) return;

    setAdding(true);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find((i) => i._id === product._id);

    if (exists) exists.quantity += 1;
    else
      cart.push({
        _id: product._id,
        name: product.name,
        price,
        image,
        quantity: 1,
      });

    localStorage.setItem("cart", JSON.stringify(cart));

    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }, 900);
  };

  return (
    <div className="space-y-4">

      {/* ❤️ WISHLIST BUTTON */}
      <button
        onClick={toggleWish}
        disabled={busy}
        className="px-4 py-2 border rounded-lg flex items-center gap-2 transition hover:bg-gray-100"
      >
        <Heart
          size={20}
          className={wish ? "text-red-500 fill-red-500" : "text-gray-700"}
        />
        {wish ? "Wishlisted" : "Add to Wishlist"}
      </button>

      {/* 🛒 ADD TO CART */}
      <button
        onClick={addToCart}
        disabled={adding || added}
        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 
          ${added ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}
        `}
      >
        {adding ? (
          <>
            <Loader2 size={20} className="animate-spin" /> Adding...
          </>
        ) : added ? (
          <>
            <CheckCircle2 size={20} /> Added
          </>
        ) : (
          <>
            <ShoppingCart size={20} /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
}