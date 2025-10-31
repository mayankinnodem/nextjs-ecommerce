"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist safely
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist(stored);
    } catch (err) {
      console.error("Error reading wishlist:", err);
      setWishlist([]);
    }
  }, []);

  // Keep localStorage synced
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Move item to cart
  const handleMoveToCart = (id) => {
    const itemToMove = wishlist.find((item) => item._id === id);
    if (!itemToMove) return;

    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find((item) => item._id === id);

      if (existing) existing.quantity += 1;
      else cart.push({ ...itemToMove, quantity: 1 });

      localStorage.setItem("cart", JSON.stringify(cart));

      setWishlist(wishlist.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // Remove item
  const handleRemove = (id) => {
    setWishlist(wishlist.filter((item) => item._id !== id));
  };

  // Go to product page
  const handleViewProduct = (id) => {
    router.push(`/product/${id}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Wishlist ❤️</h1>

      {wishlist.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">
          Your wishlist is empty.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col items-center"
            >
              <img
                src={item.images?.[0]?.url || "/placeholder.png"}
                alt={item.name}
                className="w-40 h-40 object-cover rounded-xl mb-3 cursor-pointer"
                onClick={() => handleViewProduct(item._id)}
              />
              <h3
                className="font-semibold text-lg text-gray-800 hover:text-blue-600 cursor-pointer"
                onClick={() => handleViewProduct(item._id)}
              >
                {item.name}
              </h3>
              <p className="text-gray-600">
                ₹{Number(item.price).toLocaleString()}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleMoveToCart(item._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
