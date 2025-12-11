"use client";

import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(stored);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem("cart", JSON.stringify(cartItems));

      // ⭐ live update event emit
      const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: totalQty }));
    }
  }, [cartItems, initialized]);

  const handleQuantityChange = (id, type) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity:
                type === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      router.push(`/login?redirect=/checkout`);
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 relative">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <ShoppingCart size={32} className="text-indigo-600" />
        My Cart
      </h1>

      {!initialized ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">🛍️ Your Cart is Empty</p>
          <button
            onClick={() => router.push("/shop")}
            className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-6 pb-32">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border"
              >
                <div className="flex items-center gap-4 w-full sm:w-2/3">
                  <img
                    src={item.image}
                    className="w-24 h-24 rounded-xl object-cover hover:scale-105 transition"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-800 text-lg line-clamp-1">
                      {item.name}
                    </h2>
                    <p className="text-indigo-600 font-bold text-lg">
                      ₹{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-1">
                    <button
                      onClick={() => handleQuantityChange(item._id, "dec")}
                      className="text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item._id, "inc")}
                      className="text-lg font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Checkout Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl p-6 flex justify-between items-center border-t">
            <div className="text-xl font-bold text-gray-900">
              Subtotal:{" "}
              <span className="text-indigo-700">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-6 py-3 rounded-full text-lg hover:bg-green-700 transition active:scale-95"
            >
              Checkout →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
