"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Box,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStock: 0,
    newOrders: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Products
        const productsRes = await fetch("/api/products");
        const productsData = productsRes.ok
          ? await productsRes.json()
          : { success: false, products: [] };

        // ✅ Orders
        const ordersRes = await fetch("/api/user/order/user-orders");
        const ordersData = ordersRes.ok
          ? await ordersRes.json()
          : { success: false, orders: [] };

        // ✅ Users
        const usersRes = await fetch("/api/user");
        const usersData = usersRes.ok
          ? await usersRes.json()
          : { success: false, users: [] };

        setStats({
          totalProducts: productsData.success
            ? productsData.products.length
            : 0,

          totalOrders: ordersData.success
            ? ordersData.orders.length
            : 0,

          totalUsers: usersData.success
            ? usersData.users.length
            : 0,

          lowStock: productsData.success
            ? productsData.products.filter((p) => p.stock < 5).length
            : 0,

          newOrders: ordersData.success
            ? ordersData.orders.filter(
                (o) =>
                  new Date(o.createdAt) >
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length
            : 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-700">Loading dashboard...</p>;
  }

  return (
    <div className="text-gray-900 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Total Products */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <Box className="w-10 h-10 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Total Products</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <ShoppingCart className="w-10 h-10 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <Users className="w-10 h-10 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Users</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <AlertTriangle className="w-10 h-10 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold">Low Stock</h3>
            <p className="text-2xl font-bold mt-1">{stats.lowStock}</p>
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <TrendingUp className="w-10 h-10 text-yellow-600" />
          <div>
            <h3 className="text-lg font-semibold">New Orders (7d)</h3>
            <p className="text-2xl font-bold mt-1">{stats.newOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Quick Insights</h3>
        <p className="text-gray-700">
          You can add charts or graphs here using libraries like Chart.js or
          Recharts.
        </p>
      </div>
    </div>
  );
}
