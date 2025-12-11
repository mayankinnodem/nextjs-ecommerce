"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Completed",
  // "Cancelled by User",
  "Cancelled by Admin",
  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Refund Initiated",
  "Refund Completed"
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
      console.error("Orders Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    let cancelReason = "";

    // 🔥 Require reason when admin cancels
    if (newStatus === "Cancelled by Admin") {
      cancelReason = prompt("Please enter cancellation reason:");
      if (!cancelReason || !cancelReason.trim()) {
        alert("Cancellation reason is required.");
        return;
      }
    }

    try {
      await fetch("/api/admin/admin-orders/update-order-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus, cancelReason })
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
      <h2 className="text-2xl font-bold mb-6">All Orders</h2>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="border p-5 rounded-xl bg-white shadow space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <p
                className="font-semibold text-blue-600 cursor-pointer hover:underline"
                onClick={() => router.push(`/admin-dashboard/orders/${order._id}`)}
              >
                Order ID: #{order._id}
              </p>

              <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
            </div>

            {/* USER DETAILS */}
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-semibold">{order.address?.name} ({order.address?.phone})</p>
              <p className="text-sm text-gray-700">
                {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
              </p>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-3">
              <p className="font-semibold">Status:</p>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* CANCEL REASON */}
            {order.cancelReason && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                ❗ <strong>Reason:</strong> {order.cancelReason}
              </p>
            )}

            {/* AMOUNT */}
            <p className="font-bold text-lg text-purple-700">
              Total: ₹{Number(order.totalAmount).toLocaleString()}
            </p>

            {/* ITEMS */}
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between border-b pb-3">
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.productId?.images?.[0]?.url || "/placeholder.png"}
                      className="w-14 h-14 rounded border"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                      <p className="text-sm">₹{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
