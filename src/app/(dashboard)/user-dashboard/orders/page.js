"use client";

import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaClock } from "react-icons/fa";

export default function OrdersPage() {
  const orders = [
    {
      id: "ORD123",
      date: "2025-10-10",
      amount: "₹2,499",
      status: "Delivered",
      items: [
        { name: "Wireless Headphones", quantity: 1 },
        { name: "Charging Cable", quantity: 2 },
      ],
    },
    {
      id: "ORD124",
      date: "2025-09-28",
      amount: "₹1,299",
      status: "Shipped",
      items: [
        { name: "Bluetooth Speaker", quantity: 1 },
      ],
    },
    {
      id: "ORD125",
      date: "2025-09-15",
      amount: "₹899",
      status: "Pending",
      items: [
        { name: "USB-C Adapter", quantity: 1 },
      ],
    },
  ];

  // Status color map
  const statusStyles = {
    Delivered: "bg-green-100 text-green-600 border-green-400",
    Shipped: "bg-blue-100 text-blue-600 border-blue-400",
    Pending: "bg-yellow-100 text-yellow-600 border-yellow-400",
  };

  // Status icon map
  const statusIcons = {
    Delivered: <FaCheckCircle />,
    Shipped: <FaShippingFast />,
    Pending: <FaClock />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">🛍️ My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaBoxOpen className="text-5xl mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Order ID: <span className="text-purple-600">{order.id}</span>
                    </p>
                    <p className="text-sm text-gray-500">Placed on {order.date}</p>
                  </div>
                  <div
                    className={`mt-2 sm:mt-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusStyles[order.status]}`}
                  >
                    {statusIcons[order.status]}
                    {order.status}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-700">
                      <span>{item.name}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-lg font-bold text-gray-800">
                    Total Amount: <span className="text-purple-600">{order.amount}</span>
                  </p>
                  <button
                    className="mt-3 sm:mt-0 bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
                    onClick={() => alert(`Viewing details for ${order.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
