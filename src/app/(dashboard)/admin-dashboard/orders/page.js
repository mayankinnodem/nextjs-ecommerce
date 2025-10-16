// src/app/(dashboard)/admin-dashboard/orders/page.js
"use client";

import Link from "next/link";

const orders = [
  { id: 101, customer: "Ravi Kumar", total: 4500, status: "Pending" },
  { id: 102, customer: "Priya Sharma", total: 1200, status: "Shipped" },
  { id: 103, customer: "Amit Singh", total: 780, status: "Delivered" },
];

export default function OrdersPage() {
  return (
    <div>
      <h2 className="text-2xl text-gray-900 font-bold mb-6">Orders</h2>

      <table className="w-full bg-white text-gray-900 shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Order ID</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Total</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b">
              <td className="px-4 py-2">{o.id}</td>
              <td className="px-4 py-2">{o.customer}</td>
              <td className="px-4 py-2">₹{o.total}</td>
              <td className="px-4 py-2">{o.status}</td>
              <td className="px-4 py-2">
                <Link
                  href={`/admin-dashboard/orders/${o.id}`}
                  className="text-blue-600 hover:underline mr-3"
                >
                  View
                </Link>
                <button className="text-red-600 hover:underline">
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
