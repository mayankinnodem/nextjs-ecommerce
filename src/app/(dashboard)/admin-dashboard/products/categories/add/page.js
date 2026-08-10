"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";
import SeoFieldsForm, { EMPTY_SEO_FIELDS } from "@/components/admin/SeoFieldsForm";

export default function AddCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    seo: { ...EMPTY_SEO_FIELDS },
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: nameValue,
      slug: slugEdited ? prev.slug : slugify(nameValue),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        ...form,
        slug: slugify(form.slug) || slugify(form.name),
      })
    );
    if (image) formData.append("image", image);

    const res = await fetch("/api/admin/categories", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      alert("✅ Category Added!");
      router.push("/admin-dashboard/products/categories");
    } else {
      alert("❌ " + data.error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white text-gray-700 p-6 rounded shadow space-y-4">
      <input
        type="text"
        placeholder="Category Name"
        value={form.name}
        onChange={handleNameChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <div>
        <input
          type="text"
          placeholder="Slug (auto-generated from name)"
          value={form.slug}
          onChange={handleSlugChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          URL: /{form.slug || slugify(form.name) || "category-slug"}
        </p>
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />

      <input type="file" onChange={handleImageChange} />
      {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border mt-2" />}

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <SeoFieldsForm
        value={form.seo}
        onChange={(seo) => setForm({ ...form, seo })}
        showPathPreview={form.slug ? `/${form.slug}` : "/category-slug"}
        includeSchema
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Save Category
      </button>
    </form>
  );
}
