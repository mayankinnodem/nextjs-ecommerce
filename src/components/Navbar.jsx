"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaHeart, FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleStorage = (e) => {
      if (e.key === "user") {
        const u = localStorage.getItem("user");
        setUser(u ? JSON.parse(u) : null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="bg-gray-900 text-gray-200 text-sm py-2 px-4 flex justify-between items-center">
        <p className="hidden sm:block">✨ Free Shipping on orders over ₹999!</p>
        <div className="flex items-center space-x-4">
          <Link href="/help" className="hover:text-white transition">Help</Link>
          <Link href="/track" className="hover:text-white transition">Track Order</Link>
          {user ? (
            <div ref={dropdownRef} className="relative">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name || "User"} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <FaUser className="w-6 h-6" />
                )}
                <span>{user.name || "No Name"}</span>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow z-50 text-black">
                  <Link href="/user-dashboard/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <Link href="/user-dashboard/orders" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 hover:text-white transition"><FaUser /> Login</Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="text-3xl font-extrabold text-gray-900 tracking-wide">MyShop</Link>
          <nav className="hidden md:flex space-x-10 text-gray-700 font-medium">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <Link href="/shop" className="hover:text-black transition">Shop</Link>
            <Link href="/categories" className="hover:text-black transition">Categories</Link>
            <Link href="/about" className="hover:text-black transition">About</Link>
            <Link href="/contact" className="hover:text-black transition">Contact</Link>
          </nav>
          <div className="flex items-center space-x-5">
            <div className="hidden md:block relative w-64">
              <input type="text" placeholder="Search products..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              <FaSearch className="absolute right-3 top-3 text-gray-500" />
            </div>
            <Link href="/wishlist" className="relative">
              <FaHeart className="h-6 w-6 text-gray-700 hover:text-red-500 transition" />
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1.5 rounded-full">5</span>
            </Link>
            <Link href="/cart" className="relative">
              <FaShoppingCart className="h-6 w-6 text-gray-700 hover:text-black transition" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">3</span>
            </Link>
            <button className="md:hidden text-gray-700 focus:outline-none" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
              {mobileMenu ? <FaTimes className="h-7 w-7" /> : <FaBars className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <nav className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-4 space-y-3 text-gray-700 font-medium animate-slideDown">
          <Link href="/" className="block hover:text-black transition">Home</Link>
          <Link href="/shop" className="block hover:text-black transition">Shop</Link>
          <Link href="/categories" className="block hover:text-black transition">Categories</Link>
          <Link href="/about" className="block hover:text-black transition">About</Link>
          <Link href="/contact" className="block hover:text-black transition">Contact</Link>

          {user && (
            <div className="mt-2 border-t pt-2">
              <Link href="/user-dashboard/profile" className="block px-2 py-1 hover:bg-gray-100">Profile</Link>
              <Link href="/user-dashboard/orders" className="block px-2 py-1 hover:bg-gray-100">Orders</Link>
              <button onClick={handleLogout} className="w-full text-left px-2 py-1 hover:bg-gray-100">Logout</button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
