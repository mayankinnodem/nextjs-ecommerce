"use client";

import { useEffect, useState } from "react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!localUser) {
      setLoading(false);
      return;
    }

    const userId = localUser._id;

    fetch(`/api/user/order/user-orders?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="p-6 text-gray-600">Loading your orders...</p>;

  if (!orders.length)
    return <p className="p-6 text-gray-600">No orders yet.</p>;


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="border p-4 rounded-lg shadow">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p>
              <strong>Total:</strong> ₹
              {Number(order.totalAmount || order.total || 0).toLocaleString()}
            </p>

            <div className="mt-2 space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId?._id || idx}`}
                  className="flex items-center gap-3 border-b py-2"
                >
                  <img
                    src={
  item.productId?.images?.[0]?.url ||
  item.productId?.images?.[0] ||
  "/placeholder.png"
}

                    alt={item.name}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                    className="w-14 h-14 object-cover rounded border"
                  />

                  <div>
                    <p className="font-medium">
                      {item.productId?.name || item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ₹{Number(item.price).toLocaleString()}
                    </p>
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
