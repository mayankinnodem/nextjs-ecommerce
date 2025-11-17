"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/users?search=${search}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const getProfileCompletion = (u) => {
    const fields = ["name", "email", "phone", "gender", "address", "dob"];
    const filled = fields.filter((f) => u?.[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchUsers();
      else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };


  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 mb-4 rounded w-full max-w-md"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full bg-white text-gray-900 shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Profile</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Profile %</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const percent = getProfileCompletion(u);

              return (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  {/* Profile Image */}
                  <td className="px-4 py-2">
                    {u.profilePic?.url ? (
                      <Image
                        src={u.profilePic.url}
                        width={48} 
                        height={48}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs">No Img</span>
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-2 font-semibold">
                    {u.name || "—"}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-2">{u.email || "—"}</td>

                  {/* Phone */}
                  <td className="px-4 py-2">{u.phone || "—"}</td>

                  {/* Account Type */}
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-sm rounded 
                      ${u.accountType === "Admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {u.accountType || "Regular"}
                    </span>
                  </td>

                  {/* Profile Completion */}
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-1 w-32">
                      <div className="w-full bg-gray-300 rounded h-2 overflow-hidden">
                        <div
                          className="bg-green-600 h-2"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {percent}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2 flex gap-3">
                    <Link
                      href={`/admin-dashboard/users/${u._id}/view`}
                      className="text-blue-600"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin-dashboard/users/${u._id}/edit`}
                      className="text-green-600"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 border rounded ${
                p === page ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
