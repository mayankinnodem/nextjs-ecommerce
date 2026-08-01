"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function ViewCartFloatingButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [cartCount, setCartCount] = useState(0);

  const hiddenPages = [
    "/user-dashboard",
    "/admin-dashboard",
    "/cart",
    "/checkout",
    "/login",
  ];

  useEffect(() => {
    const loadCart = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalQty = stored.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalQty);
      } catch {}
    };

    loadCart();

    const updateListener = (e) => {
      if (typeof e.detail === "number") setCartCount(e.detail);
      else loadCart();
    };

    window.addEventListener("cartUpdated", updateListener);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", updateListener);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  if (cartCount === 0) return null;
  if (hiddenPages.some((p) => pathname?.startsWith(p))) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={() => router.push("/cart")}
        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full shadow-xl hover:scale-105"
        aria-label={`View cart with ${cartCount} items`}
      >
        <ShoppingCart size={20} />
        {t("cart.viewCart")} ({cartCount})
      </button>
    </div>
  );
}
