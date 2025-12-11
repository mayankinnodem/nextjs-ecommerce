"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewCartFloatingButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const hiddenPages = ["/user-dashboard", "/admin-dashboard"];
  const isCategoryPage = pathname?.startsWith("/category/");

useEffect(() => {
  const loadCart = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalQty = stored.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalQty);
    } catch {}
  };

  loadCart();

  // ⭐ event listener improved
  const updateListener = (e) => {
    setCartCount(e.detail); // direct updated qty
  };

  window.addEventListener("cartUpdated", updateListener);
  window.addEventListener("storage", loadCart);

  return () => {
    window.removeEventListener("cartUpdated", updateListener);
    window.removeEventListener("storage", loadCart);
  };
}, []);


  if (cartCount === 0) return null;
  if (hiddenPages.includes(pathname)) return null;
  if (isCategoryPage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={() => router.push("/cart")}
        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl text-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
      >
        View Cart ({cartCount})
      </button>
    </div>
  );
}
