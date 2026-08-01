"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  RotateCcw,
  Truck,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import Price from "@/components/Price";
import { useLocale } from "@/context/LocaleContext";

export default function ProductActions({ product }) {
  const { t, formatPrice } = useLocale();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wish, setWish] = useState(false);
  const [busy, setBusy] = useState(false);

  const minOrder = product.minOrder || 1;
  const [qty, setQty] = useState(minOrder);

  const price = product.salePrice || product.price;
  const mrp = product.price;
  const discount = product.discount || 0;
  const stock = product.stock || 0;
  const image = product.images?.[0]?.url;

  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 5;

  // ⭐ total price (LIVE)
const totalPrice = Number((price * qty).toFixed(2));
const totalMrp = Number((mrp * qty).toFixed(2));
const totalSaving = Number(((mrp - price) * qty).toFixed(2));

  /* ---------------- Wishlist State ---------------- */
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds")) || [];
      setWish(ids.includes(product._id));
    } catch {
      setWish(false);
    }
  }, [product._id]);

  const syncWishlistIds = (fn) => {
    const old = JSON.parse(localStorage.getItem("wishlistIds")) || [];
    localStorage.setItem("wishlistIds", JSON.stringify(fn(old)));
  };

  const toggleWish = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) {
      window.location.href = `/login?redirect=/${product.category.slug}/${product.slug}`;
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      const method = wish ? "DELETE" : "POST";
      await fetch("/api/user/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          productId: product._id,
        }),
      });

      setWish(!wish);
      syncWishlistIds((ids) =>
        wish ? ids.filter((id) => id !== product._id) : [...ids, product._id]
      );
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (e) {
      console.log("Wishlist error:", e);
    }

    setBusy(false);
  };

  /* ---------------- Add to Cart ---------------- */
  const addToCart = () => {
    if (adding || outOfStock) return;
    setAdding(true);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find((i) => i._id === product._id);

    if (exists) exists.quantity += qty;
    else {
      cart.push({
        _id: product._id,
        name: product.name,
        price,
        image,
        quantity: qty,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // 🔔 update header cart count
    const totalQty = cart.reduce((a, i) => a + i.quantity, 0);
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: totalQty }));

    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const buyNow = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?._id) {
      window.location.href = `/login?redirect=/checkout`;
      return;
    }
    if (outOfStock) return;

    addToCart();
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 300);
  };

  return (
    <>
    <div className="space-y-5 card p-5 sm:p-6">

      {/* 💰 PRICE */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-indigo-700">
            {formatPrice(totalPrice)}
          </span>

          {discount > 0 && (
            <span className="line-through text-gray-400">
              {formatPrice(totalMrp)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600">
          {formatPrice(price)} × {qty} item{qty > 1 ? "s" : ""}
        </p>

        {discount > 0 && totalSaving > 0 && (
          <p className="text-green-600 text-sm font-semibold">
            {t("product.youSave", { amount: formatPrice(totalSaving) })}
          </p>
        )}
      </div>

      {/* 📦 STOCK */}
      {outOfStock ? (
        <p className="text-red-600 font-semibold">{t("product.outOfStock")}</p>
      ) : lowStock ? (
        <p className="text-orange-600 font-semibold">
          {t("product.onlyLeft", { count: stock })}
        </p>
      ) : (
        <p className="text-green-600">{t("product.inStock")}</p>
      )}

      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="font-medium">{t("product.quantity")}</span>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQty((q) => Math.max(minOrder, q - 1))}
              className="px-3 py-1 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(stock, q + 1))}
              className="px-3 py-1 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ❤️ WISHLIST */}
      <button
        onClick={toggleWish}
        disabled={busy}
        className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-100"
      >
        <Heart
          size={20}
          className={wish ? "text-red-500 fill-red-500" : "text-gray-700"}
        />
        {wish ? t("product.wishlisted") : t("product.wishlist")}
      </button>

      {/* 🛒 ADD TO CART */}
      <button
        onClick={addToCart}
        disabled={adding || added || outOfStock}
        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold
          ${
            outOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : added
              ? "btn-accent"
              : "btn-primary"
          }`}
      >
        {adding ? (
          <>
            <Loader2 size={20} className="animate-spin" /> {t("product.adding")}
          </>
        ) : added ? (
          <>
            <CheckCircle2 size={20} /> {t("product.addedToCart")}
          </>
        ) : (
          <>
            <ShoppingCart size={20} /> {t("product.addToCart")}
          </>
        )}
      </button>

      {/* ⚡ BUY NOW */}
      {!outOfStock && (
        <button
          onClick={buyNow}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 transition font-semibold"
        >
          <Zap size={20} /> {t("product.buyNow")}
        </button>
      )}

      {/* 🔐 TRUST INFO */}
      <div className="pt-3 space-y-2 text-sm text-gray-600 border-t">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} /> {t("product.securePayments")}
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={16} /> {t("product.easyReturns")}
        </div>
        <div className="flex items-center gap-2">
          <Truck size={16} /> {t("product.fastDelivery")}
        </div>
      </div>
    </div>

    {/* Mobile sticky buy bar */}
    {!outOfStock && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe z-40">
        <div className="page-container py-3 flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-gray-500">{t("checkout.total")}</p>
            <p className="text-lg font-bold text-indigo-700">{formatPrice(totalPrice)}</p>
          </div>
          <button
            onClick={addToCart}
            disabled={adding || added}
            className="btn-primary flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {adding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            {added ? t("product.added") : t("product.addToCart")}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
