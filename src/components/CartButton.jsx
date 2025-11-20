// Global ViewCartButton Component
// Add this component inside your main layout (e.g., layout.js)
// It will show a floating "View Cart" button whenever cart has items
// Hidden on user dashboard & category pages

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewCartFloatingButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  // pages where button should NOT appear
  const hiddenPages = [
    "/user-dashboard",
    "/admin-dashboard",
  ];

  const isCategoryPage = pathname?.startsWith("/category/");

  useEffect(() => {
    const loadCart = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(stored.length);
      } catch {}
    };

    loadCart();

    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  // hide when cart empty or on restricted pages
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