"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* 🔹 Top Bar */}
      <div className="bg-gray-900 text-gray-200 text-sm py-2 px-4 flex justify-between items-center">
        <p className="hidden sm:block">✨ Free Shipping on orders over ₹999!</p>
        <div className="space-x-4">
          <Link href="/help" className="hover:text-white">Help</Link>
          <Link href="/track" className="hover:text-white">Track Order</Link>
          <Link href="/login" className="hover:text-white flex items-center gap-1">
            <FaUser className="inline" /> Login
          </Link>
        </div>
      </div>

      {/* 🔹 Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* image */}
          <Link href="/" className="text-3xl font-extrabold text-gray-900 tracking-wide">
            MyShop
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10 text-gray-700 font-medium">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <Link href="/shop" className="hover:text-black transition">Shop</Link>
            <Link href="/categories" className="hover:text-black transition">Categories</Link>
            <Link href="/about" className="hover:text-black transition">About</Link>
            <Link href="/contact" className="hover:text-black transition">Contact</Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-5">
            {/* Search */}
            <div className="hidden md:block relative w-64">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-500" />
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <FaHeart className="h-6 w-6 text-gray-700 hover:text-red-500 transition" />
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1.5 rounded-full">
                5
              </span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <FaShoppingCart className="h-6 w-6 text-gray-700 hover:text-black transition" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                3
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <FaTimes className="h-7 w-7" /> : <FaBars className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Mobile Menu */}
      {mobileMenu && (
        <nav className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-4 space-y-3 text-gray-700 font-medium">
          <Link href="/" className="block hover:text-black">Home</Link>
          <Link href="/shop" className="block hover:text-black">Shop</Link>
          <Link href="/categories" className="block hover:text-black">Categories</Link>
          <Link href="/about" className="block hover:text-black">About</Link>
          <Link href="/contact" className="block hover:text-black">Contact</Link>

          {/* Mobile Search */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
        </nav>
      )}
    </header>
  );
}
