"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserOrders({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/admin-orders?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Loading orders...</p>;
  if (!orders.length) return <p>No orders for this user.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Orders for User</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="border p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              {/* View User Button */}
              <button
                onClick={() => router.push(`/admin-dashboard/users/${order.userId}`)}
                className="text-blue-600 hover:underline text-sm"
              >
                View User
              </button>
            </div>

            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Total:</strong> ₹{Number(order.totalAmount).toLocaleString()}
            </p>

            <div className="mt-2 space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center justify-between gap-3 border-b py-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        Price: ₹{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* View Product Button */}
                  <button
                    onClick={() => router.push(`/admin-dashboard/products/${item.productId}`)}
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
