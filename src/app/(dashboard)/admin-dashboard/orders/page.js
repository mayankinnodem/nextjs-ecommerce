"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
];

export default function AdminUserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/admin-orders");
      const data = await res.json();

      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch("/api/admin/admin-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      fetchOrders();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (!orders.length) return <p>No orders found.</p>;
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Orders</h2>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="border p-5 rounded-lg shadow">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <p
                className="font-semibold text-blue-600 cursor-pointer hover:underline"
                onClick={() => router.push(`/admin-dashboard/orders/${order._id}`)}
              >
                Order ID: {order._id}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/admin-dashboard/orders/${order._id}`)}
                  className="text-green-600 hover:underline text-sm font-medium"
                >
                  View Order
                </button>

                <button
                  onClick={() => router.push(`/admin-dashboard/users/${order.userId?._id}`)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View User
                </button>
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-4">
              <p><strong>Status:</strong></p>

              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="border px-3 py-1 rounded"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* ITEMS */}
            <div className="mt-4 space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">

                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.productId?.images?.[0]?.url ||
                        item.image ||
                        "/placeholder.png"
                      }
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded"
                    />

                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-500">₹{Number(item.price || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/admin-dashboard/products/${item.productId?._id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Product
                  </button>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}