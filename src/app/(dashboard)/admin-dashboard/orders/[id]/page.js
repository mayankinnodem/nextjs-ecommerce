"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/admin-orders/single-order?id=${id}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
      else setOrder(null);
    } catch (error) {
      console.error("Order fetch error:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await fetch(`/api/admin/admin-orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, status: newStatus }),
      });
      fetchOrder();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>No order found.</p>;

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A";

  return (
    <div className="text-gray-900 p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Order Details #{order._id}</h2>

      {/* User Info */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User Info</h3>
        <p><strong>Name:</strong> {order.userId?.name || "N/A"}</p>
        <p><strong>Email:</strong> {order.user?.email || "N/A"}</p>
        <p><strong>Phone:</strong> {order.user?.phone || "N/A"}</p>
      </div>

      {/* Shipping Info */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Shipping Address</h3>
        {order.shippingAddress ? (
          <p>
            {order.shippingAddress.name}, {order.shippingAddress.address},{" "}
            {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
            {order.shippingAddress.country} - {order.shippingAddress.pinCode}
          </p>
        ) : (
          <p>N/A</p>
        )}
      </div>

      {/* Payment Info */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Payment Info</h3>
        <p><strong>Method:</strong> {order.paymentMethod || "N/A"}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-white ${
              order.paymentStatus === "Paid" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {order.paymentStatus || "Pending"}
          </span>
        </p>
      </div>

      {/* Timestamps */}
      <div className="mb-6">
        <p><strong>Placed At:</strong> {formatDate(order.createdAt)}</p>
        <p><strong>Last Updated:</strong> {formatDate(order.updatedAt)}</p>
      </div>

      {/* Items */}
      <h3 className="text-2xl font-semibold mt-6 mb-3">Items</h3>
      <div className="space-y-4">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between border p-3 rounded-md">
            <div className="flex items-center gap-4">
              <img
                src={item.productId?.images?.[0]?.url || item.image || "/placeholder.png"}
                className="w-20 h-20 object-cover rounded"
                alt={item.name || "Product"}
              />
              <div>
                <p className="font-medium">{item.name || item.productId?.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity || 0}</p>
                <p className="text-sm text-gray-600">
                  Price: ₹{Number(item.price || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={() => router.push(`/admin-dashboard/products/${item.productId?._id}`)}
            >
              View Product
            </button>
          </div>
        ))}
      </div>

      {/* Total */}
      <p className="mt-6 text-lg font-bold">
        Total: ₹{Number(order.totalAmount || 0).toLocaleString()}
      </p>
    </div>
  );
}
