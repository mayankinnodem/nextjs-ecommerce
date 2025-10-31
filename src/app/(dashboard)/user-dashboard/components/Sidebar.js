"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

const handleLogout = async () => {
  try {
    const res = await fetch("/api/user/logout", { method: "POST" });
    const data = await res.json();

    if (data.success) {
      // ✅ Clear localStorage completely
      localStorage.clear();

      // ✅ Optional: clear sessionStorage too
      sessionStorage.clear();

      // ✅ Redirect to login page
      router.push("/login");
    } else {
      console.error("Logout failed:", data.message);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};


  return (
    <div className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
        <nav className="space-y-4">
          <Link href="/user-dashboard" className="block hover:text-blue-600">
            🏠 Dashboard
          </Link>
          <Link href="/user-dashboard/orders" className="block hover:text-blue-600">
            📦 My Orders
          </Link>
          <Link href="/user-dashboard/wishlist" className="block hover:text-blue-600">
            💖 Wishlist
          </Link>
          <Link href="/user-dashboard/profile" className="block hover:text-blue-600">
            👤 Profile
          </Link>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
