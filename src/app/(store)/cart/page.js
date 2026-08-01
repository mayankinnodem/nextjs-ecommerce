"use client";

import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, ArrowRight } from "lucide-react";
import Price from "@/components/Price";
import { useLocale } from "@/context/LocaleContext";

export default function CartPage() {
  const { t } = useLocale();
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-float">
      <div className="page-container py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <ShoppingCart size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="section-title">{t("cart.title")}</h1>
            {cartItems.length > 0 && (
              <p className="text-sm text-gray-500">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {!initialized ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 flex gap-4">
                <div className="skeleton w-24 h-24 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="card text-center py-16 px-6 max-w-md mx-auto">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-gray-600 text-lg mb-6">{t("cart.empty")}</p>
            <button
              onClick={() => router.push("/shop")}
              className="btn-primary px-8 py-3"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 line-clamp-2">
                      {item.name}
                    </h2>
                    <Price
                      amount={item.price}
                      className="text-indigo-600 font-bold text-lg mt-1 block"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-xl bg-gray-50">
                    <button
                      onClick={() => handleQuantityChange(item._id, "dec")}
                      className="p-2.5 hover:bg-white rounded-l-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 font-semibold min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item._id, "inc")}
                      className="p-2.5 hover:bg-white rounded-r-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {initialized && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe z-40">
          <div className="page-container py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">{t("cart.subtotal")}</p>
              <Price amount={subtotal} className="text-2xl font-bold text-gray-900" />
            </div>
            <button
              onClick={handleCheckout}
              className="btn-accent w-full sm:w-auto px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 text-base"
            >
              {t("cart.checkout")}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
