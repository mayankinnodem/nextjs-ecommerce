"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddBrandPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", status: "active" });
  const [image, setImage] = useState(null); // File object
  const [preview, setPreview] = useState(null);

  // Image select & preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else setPreview(null);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("data", JSON.stringify(form));
    if (image) formData.append("image", image); // ✅ key = "image"

    const res = await fetch("/api/admin/brand", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Brand Added!");
      router.push("/admin-dashboard/products/brands");
    } else {
      alert("❌ " + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white text-gray-700 p-6 rounded shadow space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Brand</h2>

      <input
        type="text"
        placeholder="Brand Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />

      <input type="file" onChange={handleImageChange} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded border mt-2"
        />
      )}

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Save Brand
      </button>
    </form>
  );
}
