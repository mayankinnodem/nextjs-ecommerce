"use client";
// import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaBoxOpen, FaHeart, FaUserCircle, FaShoppingBag } from "react-icons/fa";

export default function DashboardHome() {
  const router = useRouter();
  // const { data: session } = useSession();
  const userName = "John Doe"; // Replace with session?.user?.name
  const email = "johndoe@example.com"; // Replace with session?.user?.email

  // Navigation handler
  const handleNavigate = (path) => {
    router.push(`/user-dashboard/${path}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl text-center transition-all">
        {/* Welcome Section */}
        <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
          Welcome, <span className="text-purple-600">{userName}</span> 👋
        </h1>
        <p className="text-gray-500 mb-6">{email}</p>
        <p className="text-gray-700 text-lg mb-8">
          This is your personal dashboard where you can view your orders, manage your profile, and check your wishlist.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Orders */}
          <div
            onClick={() => handleNavigate("orders")}
            className="cursor-pointer bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform"
          >
            <FaShoppingBag className="text-4xl mb-2" />
            <h2 className="text-xl font-bold">My Orders</h2>
            <p className="text-sm mt-1">Track and manage your purchases</p>
          </div>

          {/* Wishlist */}
          <div
            onClick={() => handleNavigate("wishlist")}
            className="cursor-pointer bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform"
          >
            <FaHeart className="text-4xl mb-2" />
            <h2 className="text-xl font-bold">Wishlist</h2>
            <p className="text-sm mt-1">Save your favorite items</p>
          </div>

          {/* Profile */}
          <div
            onClick={() => handleNavigate("profile")}
            className="cursor-pointer bg-gradient-to-r from-indigo-400 to-indigo-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform"
          >
            <FaUserCircle className="text-4xl mb-2" />
            <h2 className="text-xl font-bold">Profile</h2>
            <p className="text-sm mt-1">Update your details</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-10 bg-gray-50 border rounded-2xl shadow-inner p-6 text-left">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Activity Summary</h3>
          <ul className="space-y-2 text-gray-600">
            <li>🛍️ You have <span className="font-bold text-purple-600">12</span> total orders.</li>
            <li>💖 <span className="font-bold text-pink-500">8</span> items in your wishlist.</li>
            <li>⭐ <span className="font-bold text-indigo-500">5</span> reviews given so far.</li>
            <li>🎁 Upcoming delivery: <span className="font-bold">1 package arriving tomorrow.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
