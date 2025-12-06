"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaHeart, FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

export default function Navbar() {
  const router = useRouter();
  const [headerInfo, setHeaderInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  // SEARCH
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // CATEGORIES (for dropdown and optionally quick-filter)
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  // COUNTS
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  // ------------------ Fetch header info + categories ------------------
  useEffect(() => {
    async function fetchHeader() {
      try {
        const res = await fetch("/api/store/contact-section", { cache: "no-store" });
        const data = await res.json();
        setHeaderInfo(data?.data || null);
      } catch (e) {
        console.error("fetch header:", e);
      }
    }

    async function fetchCategories() {
      try {
        const res = await fetch("/api/store/categories");
        const d = await res.json();
        setCategories(Array.isArray(d?.categories) ? d.categories : []);
      } catch (e) {
        // silently ignore
      }
    }

    fetchHeader();
    fetchCategories();
  }, []);

  // ------------------ user + counts from localStorage ------------------
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const wish = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setCartCount(Array.isArray(cart) ? cart.length : 0);
    setWishCount(Array.isArray(wish) ? wish.length : 0);

    const handler = (e) => {
      if (e.key === "user") setUser(JSON.parse(localStorage.getItem("user") || null));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ------------------ Outside click to close menus ------------------
  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ------------------ Live Search (debounced) ------------------
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        // we call the same API used by shop page. It should accept ?search= and return products
        const res = await fetch(`/api/store/products?search=${encodeURIComponent(query)}&limit=6`);
        const d = await res.json();
        const items = Array.isArray(d?.products) ? d.products : [];
        setSuggestions(items);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (err) {
        console.error("search err", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // ------------------ Keyboard nav for suggestions ------------------
  const onKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      scrollToActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      scrollToActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = suggestions[activeIndex >= 0 ? activeIndex : 0];
      if (item) selectProduct(item);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const scrollToActive = () => {
    if (!suggestionsRef.current) return;
    const el = suggestionsRef.current.querySelectorAll("li")[activeIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  };

  // ------------------ Product select -> correct URL ------------------
  // Project uses product detail at: /store/products/:category_slug/:product_slug
  const selectProduct = (product) => {
    setShowSuggestions(false);
    setQuery("");

    const catSlug = product?.category?.slug || "uncategorized";
    const slug = product?.slug || product?._id;
    router.push(`/${encodeURIComponent(catSlug)}/${encodeURIComponent(slug)}`);
  };

  // ------------------ Quick search submit (go to shop with query) ------------------
  const onSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  // ------------------ Render ------------------
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md" ref={containerRef}>
      {/* TOP BAR */}
      <div className="bg-gray-900 text-gray-200 text-sm py-2 px-4 flex justify-between items-center">
        {headerInfo ? (
  <div className="flex gap-4 items-center">
    
    {/* Phone */}
    <a
      href={`tel:${headerInfo?.phone}`}
      className="flex items-center gap-1 hover:underline"
    >
      <MdPhone className="text-blue-400" />
      {headerInfo?.phone}
    </a>

    {/* Email */}
    <a
      href={`mailto:${headerInfo?.email}`}
      className="flex items-center gap-1 hover:underline"
    >
      <MdEmail className="text-blue-400" />
      {headerInfo?.email}
    </a>

    {/* Address */}
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(headerInfo?.address)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex items-center gap-1 hover:underline"
    >
      <MdLocationOn className="text-blue-400" />
      {headerInfo?.address}
    </a>

  </div>
) : (
  <div>Loading contact...</div>
)}


        <div className="flex items-center gap-4">
          <Link href="/help">Help</Link>
          <Link href="/track">Track Order</Link>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* logo */}
          <Link href="/" className="flex items-center gap-2">
            {headerInfo?.logo?.url ? (
              <Image src={headerInfo.logo.url} alt="Logo" width={140} height={40} className="object-contain" />
            ) : (
              <span className="text-3xl font-extrabold text-gray-900">MyShop</span>
            )}
          </Link>

          {/* nav links (desktop) */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/shop" className="hover:text-black">Shop</Link>

            {/* categories dropdown */}
            <div className="relative">
              <button onClick={() => setCatOpen(s => !s)} className="hover:text-black">Categories</button>
              {catOpen && (
                <div className="absolute mt-2 bg-white shadow rounded w-48 z-40">
                  {categories.length ? categories.map(c => (
                    <Link key={c.slug} href={`/${c.slug}`} className="block px-4 py-2 hover:bg-gray-100">{c.name}</Link>
                  )) : <div className="px-4 py-2 text-sm text-gray-500">No categories</div>}
                </div>
              )}
            </div>
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </nav>

          {/* center search */}
          <form onSubmit={onSubmit} className="relative max-w-xl mx-4 md:mx-0">
            <div className="flex items-center border border-gray-300 rounded-lg px-2">
              <input
                aria-label="Search products"
                className="w-full p-2 text-sm outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
                onKeyDown={onKeyDown}
                placeholder="Search products, e.g. led mirror"
              />
              <button type="submit" aria-label="submit search" className="p-2">
                <FaSearch />
              </button>
            </div>

            {/* suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul ref={suggestionsRef} className="absolute left-0 right-0 bg-white border mt-1 rounded shadow max-h-64 overflow-y-auto z-50">
                {suggestions.map((p, idx) => (
                  <li
                    key={p._id}
                    onClick={() => selectProduct(p)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`cursor-pointer p-2 flex gap-3 items-center ${activeIndex === idx ? 'bg-gray-100' : ''}`}
                  >
                    {
                      p?.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <img
                          src="/placeholder.png"
                          alt="no image"
                          className="w-12 h-12 object-cover rounded"
                        />
                      )
                    }
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-gray-500">₹{p.price}</div>
                    </div>
                    <div className="text-xs text-gray-400">{p?.category?.slug}</div>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-4">
            <Link href="/user-dashboard/wishlist" className="relative">
              <FaHeart className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1.5 rounded-full">{wishCount}</span>
            </Link>

            <Link href="/cart" className="relative">
              <FaShoppingCart className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">{cartCount}</span>
            </Link>

            {user ? (
  <div className="relative group">
    <button className="flex items-center gap-2 focus:outline-none">
      {user.profilePic ? (
        <img
          src={user.profilePic}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border"
        />
      ) : (
        <FaUser className="w-6 h-6" />
      )}
      <span className="hidden sm:inline font-medium">{user.name || "Account"}</span>
    </button>

    {/* Dropdown */}
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
      <Link
        href="/user-dashboard/profile"
        className="block px-4 py-2 text-sm hover:bg-gray-100"
      >
        My Profile
      </Link>
      <Link
        href="/user-dashboard/orders"
        className="block px-4 py-2 text-sm hover:bg-gray-100"
      >
        My Orders
      </Link>
      <button
        onClick={() => {
          localStorage.removeItem("user");
          setUser(null);
          router.push("/");
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  </div>
) : (
              <Link href="/login" className="flex items-center gap-1"> <FaUser /> Login</Link>
            )}

            {/* mobile toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileMenu(m => !m)} aria-label="Toggle menu">
              {mobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* mobile menu content */}
        {mobileMenu && (
          <nav className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-4 space-y-3">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <div>
              <button onClick={() => setCatOpen(s => !s)} className="w-full text-left">Categories</button>
              {catOpen && (
                <div className="pl-4">
                  {categories.length ? categories.map(c => (
                    <Link key={c.slug} href={`/all-categories/${c.slug}`} className="block py-1">{c.name}</Link>
                  )) : <div className="py-1 text-sm text-gray-500">No categories</div>}
                </div>
              )}
            </div>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <div className="pt-2 border-t">
              <Link href="/cart">Cart ({cartCount})</Link>
              <Link href="/wishlist">Wishlist ({wishCount})</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
 