"use client";
import Link from "next/link";
// import { signOut } from "next-auth/react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
        <nav className="space-y-4">
          <Link href="/user-dashboard" className="block hover:text-blue-600">🏠 Dashboard</Link>
          <Link href="/user-dashboard/orders" className="block hover:text-blue-600">📦 My Orders</Link>
          <Link href="/user-dashboard/wishlist" className="block hover:text-blue-600">💖 Wishlist</Link>
          <Link href="/user-dashboard/profile" className="block hover:text-blue-600">👤 Profile</Link>
        </nav>
      </div>
      {/* <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-6 bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        Logout
      </button> */}
    </div>
  );
}
