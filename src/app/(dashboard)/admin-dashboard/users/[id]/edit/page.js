"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditUserPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      if (!data.error) setForm(data);
    };
    fetchData();
  }, [id]);

  if (!form) return <p>Loading...</p>;

  const handleSave = async () => {
    const res = await fetch(`/api/user/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      alert("User updated!");
      router.push(`/admin-dashboard/users/${id}/view`);
    } else {
      alert("Error updating");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Edit User</h2>

      {/* PROFILE IMAGE PREVIEW */}
      <div className="mb-6">
        {form.profilePic?.url ? (
          <img
            src={form.profilePic.url}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-lg border"
          />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-lg">
            No Image
          </div>
        )}
      </div>

      {/* USER INPUT FIELDS */}
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(form)
          .filter((key) => key !== "profilePic") // image object edit से बाहर
          .map((key) =>
            typeof form[key] === "string" ? (
              <div key={key}>
                <label className="capitalize text-gray-600">{key}</label>
                <input
                  className="border p-2 rounded w-full"
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                />
              </div>
            ) : null
          )}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <button
        onClick={() => router.push(`/admin-dashboard/users/${id}/view`)}
        className="mt-4 ml-2 bg-gray-600 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
}
