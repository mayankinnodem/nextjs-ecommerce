"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);

  const categorySlug = product?.category?.slug || "unknown";
  const productSlug = product?.slug || "product";
  const image = product?.images?.[0]?.url || "/placeholder.png";

  // ✅ initial state from localStorage wishlistIds
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds")) || [];
      setIsWishlisted(ids.includes(product._id));
    } catch {
      setIsWishlisted(false);
    }
  }, [product._id]);

  const syncWishlistIds = (updaterFn) => {
    const current = JSON.parse(localStorage.getItem("wishlistIds")) || [];
    const updated = updaterFn(current);
    localStorage.setItem("wishlistIds", JSON.stringify(updated));
  };

  // ❤️ toggle wishlist
  const handleWishlistToggle = async () => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser?._id) {
      alert("Please login to use wishlist");
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      if (isWishlisted) {
        // remove
        await fetch("/api/user/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localUser._id,
            productId: product._id,
          }),
        });

        setIsWishlisted(false);
        syncWishlistIds((ids) => ids.filter((id) => id !== product._id));
      } else {
        // add
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localUser._id,
            productId: product._id,
          }),
        });

        setIsWishlisted(true);
        syncWishlistIds((ids) =>
          ids.includes(product._id) ? ids : [...ids, product._id]
        );
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setBusy(false);
    }
  };

  // 🛒 Add to cart (same जैसा पहले था)
  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find((item) => item._id === product._id);

    if (existing) existing.quantity += 1;
    else
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image,
        quantity: 1,
      });

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart ✅");
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white relative">
      {/* ❤️ Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        disabled={busy}
        className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow hover:scale-110 transition"
      >
        <Heart
          size={20}
          className={
            isWishlisted ? "text-red-500 fill-red-500" : "text-gray-700"
          }
        />
      </button>

      <Link href={`/${categorySlug}/${productSlug}`}>
        <img
          src={image}
          alt={product?.name}
          className="w-full h-56 object-cover"
        />
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500">₹{product.price}</p>

        <button
          onClick={handleAddToCart}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
