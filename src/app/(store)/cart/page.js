"use client";

import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(stored);
      setInitialized(true);
    } catch (err) {
      console.error("Error reading cart:", err);
    }
  }, []);

  // Save cart on changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, initialized]);

  const handleQuantityChange = (id, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity } : item))
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
      alert("Please login first to proceed to checkout!");
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Your Cart
        </h1>

        {!initialized ? (
          <p className="text-center text-gray-600 text-lg">Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">🛍️ Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-2/3">
                  <img
                    src={item.images?.[0]?.url || "/placeholder.png"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="font-medium text-gray-800">{item.name}</h2>
                    <p className="text-gray-600">
                      ₹{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id, e.target.value)
                    }
                    className="w-16 border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 border-t pt-6">
              <div className="text-xl font-semibold text-gray-800">
                Subtotal: ₹{subtotal.toLocaleString()}
              </div>
              <button
                onClick={handleCheckout}
                className="mt-4 sm:mt-0 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
