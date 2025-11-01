"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Box,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const LOW_STOCK_LIMIT = 5; // change as needed

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStock: 0,
    newOrders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]); // optional list for UI
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel fetch all three endpoints
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/users"),
        ]);

        // parse responses safely
        const productsData = productsRes.ok ? await productsRes.json() : { success: false, products: [], lowStock: undefined };
        const ordersData = ordersRes.ok ? await ordersRes.json() : { success: false, orders: [], total: undefined };
        const usersData = usersRes.ok ? await usersRes.json() : { success: false, users: [], total: undefined };

        // derive totals with fallbacks
        const totalProducts = productsData.success
          ? (Array.isArray(productsData.products) ? productsData.products.length : (typeof productsData.total === "number" ? productsData.total : 0))
          : 0;

        // orders API might return `orders` array or `total`
        const totalOrders = ordersData.success
          ? (typeof ordersData.total === "number" ? ordersData.total : (Array.isArray(ordersData.orders) ? ordersData.orders.length : 0))
          : 0;

        const totalUsers = usersData.success
          ? (typeof usersData.total === "number" ? usersData.total : (Array.isArray(usersData.users) ? usersData.users.length : 0))
          : 0;

        // compute lowStock: prefer backend-provided lowStock, otherwise compute client-side
        let lowStockCount = 0;
        let lowItems = [];

        if (productsData.success && typeof productsData.lowStock === "number") {
          lowStockCount = productsData.lowStock;
          // if backend provided list also:
          if (Array.isArray(productsData.lowStockProducts)) lowItems = productsData.lowStockProducts;
        } else if (productsData.success && Array.isArray(productsData.products)) {
          lowItems = productsData.products.filter((p) => (Number(p?.stock ?? 0) < LOW_STOCK_LIMIT));
          lowStockCount = lowItems.length;
        } else {
          lowStockCount = 0;
          lowItems = [];
        }

        // newOrders (last 7 days) — derive from orders array if available
        let newOrdersCount = 0;
        if (ordersData.success && Array.isArray(ordersData.orders)) {
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          newOrdersCount = ordersData.orders.filter((o) => {
            const created = o?.createdAt ? new Date(o.createdAt).getTime() : 0;
            return created > weekAgo;
          }).length;
        } else {
          newOrdersCount = 0;
        }

        if (!mounted) return;

        setStats({
          totalProducts,
          totalOrders,
          totalUsers,
          lowStock: lowStockCount,
          newOrders: newOrdersCount,
        });

        setLowStockItems(lowItems);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        if (mounted) {
          setError("Failed to load dashboard stats.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-gray-700">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
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
            <h3 className="text-lg font-semibold">Low Stock (&lt; {LOW_STOCK_LIMIT})</h3>
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

      {/* Quick Insights + optional low-stock list */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Quick Insights</h3>
        <p className="text-gray-700 mb-3">
          You can add charts or graphs here using libraries like Chart.js or Recharts.
        </p>

        {lowStockItems && lowStockItems.length > 0 ? (
          <>
            <h4 className="font-medium mb-2">Low stock items (sample)</h4>
            <div className="max-h-40 overflow-auto">
              <ul className="text-sm space-y-1">
                {lowStockItems.slice(0, 10).map((p) => (
                  <li key={p._id} className="flex justify-between">
                    <span>{p.name || p.title || "Untitled product"}</span>
                    <span className="font-semibold">{Number(p.stock ?? 0)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">No low-stock items at the moment.</p>
        )}
      </div>
    </div>
  );
}
