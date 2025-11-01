"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewUserPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      if (!data.error) setUser(data);
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">View User</h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(user).map(([key, value]) => (
          <p key={key}>
            <strong>{key}: </strong> {String(value)}
          </p>
        ))}
      </div>

      <button
        onClick={() => router.push(`/admin-dashboard/users/${id}/edit`)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Edit
      </button>
    </div>
  );
}
