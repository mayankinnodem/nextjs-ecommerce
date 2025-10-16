// src/app/(dashboard)/admin-dashboard/orders/[id]/page.js
"use client";

import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();

  // Normally fetch from API
  const order = {
    id,
    customer: "Ravi Kumar",
    items: [
      { name: "Leather Jacket", qty: 1, price: 2500 },
      { name: "Leather Belt", qty: 2, price: 200 },
    ],
    total: 2900,
    status: "Pending",
  };

  return (
    <div className="text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Order #{order.id}</h2>
      <p><strong>Customer:</strong> {order.customer}</p>
      <p><strong>Status:</strong> {order.status}</p>

      <h3 className="text-xl font-semibold mt-6 mb-2">Items</h3>
      <ul className="list-disc pl-6">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.qty} x {item.name} – ₹{item.price}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-lg font-bold">Total: ₹{order.total}</p>
    </div>
  );
}
