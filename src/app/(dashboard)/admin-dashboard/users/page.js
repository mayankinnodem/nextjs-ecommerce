// src/app/(dashboard)/admin-dashboard/users/page.js
"use client";

import Link from "next/link";

const users = [
  { id: 1, name: "Ravi Kumar", email: "ravi@example.com", role: "Customer" },
  { id: 2, name: "Priya Sharma", email: "priya@example.com", role: "Customer" },
  { id: 3, name: "Admin User", email: "admin@example.com", role: "Admin" },
];

export default function UsersPage() {
  return (
    <div>
      <h2 className="text-2xl text-gray-900 font-bold mb-6">Users</h2>

      <table className="w-full bg-white text-gray-900 shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="px-4 py-2">{u.id}</td>
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2">
                <Link
                  href={`/admin-dashboard/users/${u.id}`}
                  className="text-blue-600 hover:underline mr-3"
                >
                  View
                </Link>
                <button className="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
