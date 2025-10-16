// src/app/(dashboard)/admin-dashboard/users/[id]/page.js
"use client";

import { useParams } from "next/navigation";

export default function UserDetailsPage() {
  const { id } = useParams();

  // Normally fetch from API
  const user = {
    id,
    name: "Ravi Kumar",
    email: "ravi@example.com",
    role: "Customer",
    orders: [101, 105, 110],
  };

  return (
    <div className="text-gray-900">
      <h2 className="text-2xl font-bold mb-6">User #{user.id}</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <h3 className="text-xl font-semibold mt-6 mb-2">Orders</h3>
      <ul className="list-disc pl-6">
        {user.orders.map((o) => (
          <li key={o}>Order #{o}</li>
        ))}
      </ul>
    </div>
  );
}
