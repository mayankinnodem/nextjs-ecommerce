"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";
import SeoFieldsForm, { EMPTY_SEO_FIELDS } from "@/components/admin/SeoFieldsForm";
import { structuredDataToText } from "@/lib/seoSchema";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    seo: { ...EMPTY_SEO_FIELDS },
  });

  const [slugEdited, setSlugEdited] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      const res = await fetch(`/api/admin/categories/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setForm({
          name: data.category.name,
          slug: data.category.slug,
          description: data.category.description || "",
          status: data.category.status,
          seo: {
            ...EMPTY_SEO_FIELDS,
            ...(data.category.seo || {}),
            structuredDataText: structuredDataToText(data.category.seo?.structuredData),
          },
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

      <div>
        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={handleSlugChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">URL: /{form.slug || "category-slug"}</p>
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="file"
        onChange={(e) => setImage({ ...image, file: e.target.files[0] })}
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

      <SeoFieldsForm
        value={form.seo}
        onChange={(seo) => setForm({ ...form, seo })}
        showPathPreview={form.slug ? `/${form.slug}` : "/category-slug"}
        includeSchema
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Update Category
      </button>
    </form>
  );
}
