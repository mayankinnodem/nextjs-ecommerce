"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", description: "", status: "active" });
  const [image, setImage] = useState(null); // {file} or {url, public_id}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      const res = await fetch(`/api/admin/brand/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setForm({
          name: data.brand.name,
          description: data.brand.description,
          status: data.brand.status,
        });
        if (data.brand.image) {
          setImage({ url: data.brand.image.url, public_id: data.brand.image.public_id });
        }
      }
      setLoading(false);
    };
    fetchBrand();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("data", JSON.stringify(form));
    if (image?.file) formData.append("image", image.file);

    const res = await fetch(`/api/admin/brand/${params.id}`, { method: "PUT", body: formData });
    const data = await res.json();
    if (data.success) {
      alert("✅ Brand Updated!");
      router.push("/admin-dashboard/products/brands");
    } else alert("❌ " + data.error);
  };

  if (loading) return <p>Loading...</p>;

  // 🟢 Preview Logic
  const previewUrl = image?.file
    ? URL.createObjectURL(image.file)
    : image?.url
    ? image.url
    : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-gray-900 p-6 rounded shadow space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Edit Brand</h2>

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

      <input
        type="file"
        onChange={(e) => setImage({ file: e.target.files[0] })}
      />

      {/* Image Preview */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-32 h-32 object-cover rounded border"
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
        Update Brand
      </button>
    </form>
  );
}
