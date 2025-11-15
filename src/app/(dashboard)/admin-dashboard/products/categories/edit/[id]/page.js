"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  const [image, setImage] = useState(null); // {file} | {url, public_id}
  const [loading, setLoading] = useState(true);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  useEffect(() => {
    const fetchCategory = async () => {
      const res = await fetch(`/api/admin/categories/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setForm({
          name: data.category.name,
          slug: data.category.slug,
          description: data.category.description,
          status: data.category.status,
        });

        if (data.category.image) {
          setImage({
            url: data.category.image.url,
            public_id: data.category.image.public_id,
          });
        }
      }

      setLoading(false);
    };

    fetchCategory();
  }, [params.id]);

  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    setForm({ ...form, name: nameValue, slug: generateSlug(nameValue) });
  };

  const handleSlugChange = (e) => {
    setForm({ ...form, slug: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("data", JSON.stringify(form));
    if (image?.file) formData.append("image", image.file);

    const res = await fetch(`/api/admin/categories/${params.id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Category Updated!");
      router.push("/admin-dashboard/products/categories");
    } else {
      alert("❌ " + data.error);
    }
  };

  if (loading) return <p>Loading...</p>;

  const previewUrl =
    image?.file
      ? URL.createObjectURL(image.file)
      : image?.url
      ? image.url
      : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-gray-900 p-6 rounded shadow space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Edit Category</h2>

      <input
        type="text"
        placeholder="Category Name"
        value={form.name}
        onChange={handleNameChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="text"
        placeholder="Slug"
        value={form.slug}
        onChange={handleSlugChange}
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
        Update Category
      </button>
    </form>
  );
}
