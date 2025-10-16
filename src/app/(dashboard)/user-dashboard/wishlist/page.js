"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();

  // Sample wishlist data
  const [wishlist, setWishlist] = useState([
    { id: 1, name: "Nike Air Max", price: "₹5,999", image: "/demo.jpeg" },
    { id: 2, name: "Apple Watch", price: "₹25,499", image: "/demo.jpeg" },
    { id: 3, name: "Sony Headphones", price: "₹7,299", image: "/demo.jpeg" },
  ]);

  // Move item to cart
  const handleMoveToCart = (id) => {
    alert(`Item ID ${id} moved to cart!`);
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  // Remove item from wishlist
  const handleRemove = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  // Go to product page
  const handleViewProduct = (id) => {
    router.push(`/product/${id}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Wishlist ❤️</h1>

      {wishlist.length === 0 ? (
        <p className="text-gray-600 text-center">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-40 h-40 object-cover rounded-xl mb-3"
                onClick={() => handleViewProduct(item.id)}
              />
              <h3
                className="font-semibold text-lg text-gray-800 hover:text-blue-600"
                onClick={() => handleViewProduct(item.id)}
              >
                {item.name}
              </h3>
              <p className="text-gray-600">{item.price}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleMoveToCart(item.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
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
