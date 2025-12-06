"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser?._id) {
      setLoading(false);
      return;
    }

    fetch(`/api/user/wishlist?userId=${localUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        const products = data?.wishlist || [];
        setWishlist(products);

        const ids = products.map((p) => p._id);
        localStorage.setItem("wishlistIds", JSON.stringify(ids));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    const localUser = JSON.parse(localStorage.getItem("user"));

    await fetch(`/api/user/wishlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: localUser._id, productId }),
    });

    setWishlist((prev) => prev.filter((item) => item._id !== productId));

    const ids =
      JSON.parse(localStorage.getItem("wishlistIds")).filter((id) => id !== productId);
    localStorage.setItem("wishlistIds", JSON.stringify(ids));
  };

  const handleMoveToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);

    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));
    handleRemove(product._id);
    alert("Moved to cart 🛒");
  };

  if (loading) return <p className="text-center p-6 text-lg">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        My Wishlist ❤️
        <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full">
          {wishlist.length} items
        </span>
      </h1>

      {wishlist.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const categorySlug = item?.categorySlug || item?.category?.slug || "unknown";
            const productSlug = item?.slug || "product";
            const image = item?.images?.[0]?.url || "/placeholder.png";

            return (
              <div
                key={item._id}
                className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white relative"
              >
                {/* 💖 Remove (filled heart like ProductCard) */}
                <button
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow hover:scale-110 transition"
                >
                  <Heart size={20} className="text-red-500 fill-red-500" />
                </button>

                {/* 🖼 same clickable image */}
                <Link href={`/${categorySlug}/${productSlug}`}>
                  <img
                    src={image}
                    alt={item?.name}
                    className="w-full h-56 object-cover"
                  />
                </Link>

                <div className="p-4 space-y-2">
                  {/* 📝 same clickable title */}
                  <Link href={`/${categorySlug}/${productSlug}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-indigo-600">
                      {item?.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-500">₹{item?.price}</p>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
