"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { MdPhone, MdEmail, MdLocationOn } from "react-icons/md";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useLocale } from "@/context/LocaleContext";

function SearchSuggestions({ suggestions, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <ul className="absolute bg-white w-full shadow-lg top-full mt-1 rounded-lg max-h-64 overflow-auto border z-50">
      {suggestions.map((p) => (
        <li key={p._id}>
          <button
            type="button"
            onClick={() => onSelect(p)}
            className="flex w-full items-center gap-2 p-3 border-b hover:bg-gray-50 text-left"
          >
            <img
              src={p.images?.[0]?.url || "/placeholder.svg"}
              alt=""
              className="w-10 h-10 object-cover rounded bg-gray-100"
            />
            <span className="flex-1 text-sm text-gray-800">{p.name}</span>
            <span className="text-xs text-gray-500">{p.category?.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { t } = useLocale();

  const [headerInfo, setHeaderInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    fetch("/api/store/contact-section", {
      cache: "force-cache",
      next: { revalidate: 600 },
    })
      .then((r) => r.json())
      .then((d) => setHeaderInfo(d?.data || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const syncCounts = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const wish = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      setCartCount(cart.reduce((sum, i) => sum + (i.quantity || 1), 0));
      setWishCount(wish.length);
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    const onCartUpdate = (e) => {
      if (typeof e.detail === "number") setCartCount(e.detail);
      else syncCounts();
    };

    const onWishlistUpdate = () => syncCounts();

    syncCounts();
    window.addEventListener("storage", syncCounts);
    window.addEventListener("cartUpdated", onCartUpdate);
    window.addEventListener("wishlistUpdated", onWishlistUpdate);

    return () => {
      window.removeEventListener("storage", syncCounts);
      window.removeEventListener("cartUpdated", onCartUpdate);
      window.removeEventListener("wishlistUpdated", onWishlistUpdate);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/store/products?search=${encodeURIComponent(query)}&limit=6`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const d = await res.json();
          setSuggestions(d.products || []);
          setShowSuggestions(true);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const selectProduct = (p) => {
    router.push(`/${p.category?.slug}/${p.slug}`);
    setQuery("");
    setShowSuggestions(false);
    setMobileMenu(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="bg-gray-900 text-gray-200 text-xs sm:text-sm py-2 px-4 flex justify-between items-center">
        {headerInfo && (
          <div className="flex gap-4 items-center flex-wrap">
            {headerInfo.phone && (
              <a
                href={`tel:${headerInfo.phone}`}
                className="flex gap-1 items-center hover:text-indigo-300 transition"
              >
                <MdPhone className="text-indigo-400" /> {headerInfo.phone}
              </a>
            )}
            {headerInfo.email && (
              <a
                href={`mailto:${headerInfo.email}`}
                className="hidden sm:flex gap-1 items-center hover:text-indigo-300 transition"
              >
                <MdEmail className="text-indigo-400" /> {headerInfo.email}
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <LocaleSwitcher variant="dark" />
          <Link href="/help" className="hover:text-white transition">
            {t("nav.help")}
          </Link>
          <Link href="/track" className="hover:text-white transition">
            {t("nav.track")}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {headerInfo?.logo?.url ? (
            <Image
              src={headerInfo.logo.url}
              height={44}
              width={44}
              alt={headerInfo?.title || headerInfo?.companyName || "Logo"}
            />
          ) : (
            <span className="text-xl font-extrabold text-gray-900">
              {headerInfo?.title || headerInfo?.companyName || "Store"}
            </span>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-indigo-600 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex relative flex-1 max-w-md">
          <input
            className="input-field pr-10 py-2 text-sm"
            placeholder={t("nav.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            aria-label="Search products"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={selectProduct}
            />
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/user-dashboard/wishlist"
            className="relative p-1 hover:text-indigo-600 transition"
            aria-label={`Wishlist${wishCount ? `, ${wishCount} items` : ""}`}
          >
            <FaHeart className="h-5 w-5 text-gray-700" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {wishCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative p-1 hover:text-indigo-600 transition"
            aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
          >
            <FaShoppingCart className="h-5 w-5 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link
              href="/user-dashboard"
              className="hidden sm:flex items-center gap-2 hover:text-indigo-600 transition"
            >
              {user.profilePic ? (
                <Image
                  src={user.profilePic}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border-2 border-indigo-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaUser className="text-indigo-600 text-sm" />
                </div>
              )}
              <span className="text-sm font-medium">
                {user.name?.split(" ")[0] || "User"}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 hover:text-indigo-600 transition text-sm font-medium"
            >
              <FaUser /> {t("nav.login")}
            </Link>
          )}

          <button
            className="lg:hidden p-1"
            onClick={() => setMobileMenu((x) => !x)}
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div className="lg:hidden border-t px-4 py-4 space-y-4 bg-white animate-fadeIn">
          <div className="relative">
            <input
              className="input-field pr-10 py-2 text-sm"
              placeholder={t("nav.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {showSuggestions && (
              <SearchSuggestions
                suggestions={suggestions}
                onSelect={selectProduct}
              />
            )}
          </div>

          <nav className="flex flex-col gap-3 text-gray-700 font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="hover:text-indigo-600 transition"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-100" />
            <Link href="/cart" onClick={() => setMobileMenu(false)}>
              {t("nav.cart")} ({cartCount})
            </Link>
            <Link
              href="/user-dashboard/wishlist"
              onClick={() => setMobileMenu(false)}
            >
              {t("nav.wishlist")} ({wishCount})
            </Link>
            {user ? (
              <Link
                href="/user-dashboard"
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-2"
              >
                <FaUser /> {t("nav.account")}
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenu(false)}>
                {t("nav.login")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
