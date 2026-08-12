"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  CheckCircle2,
  Loader2,
  Flame,
  Sparkles,
} from "lucide-react";
import Price from "@/components/Price";
import { useLocale } from "@/context/LocaleContext";

export default function ProductCard({ product }) {
  const { t } = useLocale();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const categorySlug = product?.category?.slug || "category";
  const productSlug = product?.slug || "product";

  const image = product?.images?.[0]?.url || "/placeholder.svg";
  const price = product?.salePrice || product?.price;
  const mrp = product?.price;
  const discount = product?.discount || 0;

  const stock = product?.stock || 0;
  const lowStock = stock > 0 && stock <= 5;

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("wishlistIds")) || [];
      setIsWishlisted(ids.includes(product._id));
    } catch {
      setIsWishlisted(false);
    }
  }, [product._id]);

  const syncWishlistIds = (fn) => {
    const current = JSON.parse(localStorage.getItem("wishlistIds")) || [];
    localStorage.setItem("wishlistIds", JSON.stringify(fn(current)));
  };

  const handleWishlistToggle = async () => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser?._id) {
      window.location.href = `/login?redirect=/${categorySlug}/${productSlug}`;
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      const method = isWishlisted ? "DELETE" : "POST";
      await fetch("/api/user/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localUser._id,
          productId: product._id,
        }),
      });

      setIsWishlisted(!isWishlisted);
      syncWishlistIds((ids) =>
        isWishlisted ? ids.filter((id) => id !== product._id) : [...ids, product._id]
      );
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (err) {
      console.log("Wishlist error:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleAddToCart = () => {
    if (adding || stock === 0) return;
    setAdding(true);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exists = cart.find((i) => i._id === product._id);

    if (exists) exists.quantity += 1;
    else {
      cart.push({
        _id: product._id,
        name: product.name,
        price,
        image,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", {
        detail: cart.reduce((a, i) => a + i.quantity, 0),
      })
    );

    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card group relative flex flex-col h-full">
      <button
        onClick={handleWishlistToggle}
        disabled={busy}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur p-2 sm:p-2.5 rounded-full shadow-md z-20 hover:scale-105 transition min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
      >
        <Heart
          size={16}
          className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}
        />
      </button>

      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-20">
        {discount > 0 && (
          <span className="bg-red-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
            {t("product.off", { discount })}
          </span>
        )}
        {product?.isTrending && (
          <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
            <Flame size={11} /> <span className="hidden sm:inline">{t("product.trending")}</span>
          </span>
        )}
        {product?.isNewArrival && (
          <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
            <Sparkles size={11} /> <span className="hidden sm:inline">{t("product.new")}</span>
          </span>
        )}
      </div>

      <Link href={`/${categorySlug}/${productSlug}`} className="block overflow-hidden">
        <img
          src={image}
          alt={product?.name}
          className="w-full h-36 sm:h-56 object-cover group-hover:scale-105 transition duration-500 bg-gray-100"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </Link>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1 gap-1.5 sm:gap-2">
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 gap-1">
          <span className="truncate">{product?.brand?.name}</span>
          {product?.gender && <span className="shrink-0">{product.gender}</span>}
        </div>

        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-indigo-600 line-clamp-2 min-h-[2.5rem] transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Price amount={price} className="text-base sm:text-lg font-bold text-indigo-700" />
          {discount > 0 && (
            <Price amount={mrp} className="text-xs sm:text-sm line-through text-gray-400" />
          )}
        </div>

        {product?.attributes?.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1 text-xs">
            {product.attributes.slice(0, 3).map((attr, i) => (
              <span
                key={i}
                className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600"
              >
                {attr.value}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-1">
          {stock === 0 ? (
            <p className="text-red-500 text-xs sm:text-sm font-semibold">{t("product.outOfStock")}</p>
          ) : lowStock ? (
            <p className="text-orange-500 text-xs sm:text-sm font-semibold">
              {t("product.onlyLeft", { count: stock })}
            </p>
          ) : (
            <p className="text-emerald-600 text-xs sm:text-sm hidden sm:block">{t("product.inStock")}</p>
          )}

          {added && (
            <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-semibold mb-2">
              <CheckCircle2 size={16} /> {t("product.addedToCart")}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding || added || stock === 0}
            className={`w-full py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition font-semibold text-xs sm:text-sm
              ${
                stock === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : added
                  ? "btn-accent"
                  : "btn-primary"
              }`}
          >
            {adding ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="hidden sm:inline">{t("product.adding")}</span>
              </>
            ) : added ? (
              <>
                <CheckCircle2 size={16} />
                <span className="hidden sm:inline">{t("product.added")}</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">{t("product.addToCart")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
