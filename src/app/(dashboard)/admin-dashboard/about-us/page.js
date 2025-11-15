// ✅ File: src/app/(dashboard)/admin-dashboard/about/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function AboutAdminPage() {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: { url: "" },
    stats: [{ label: "", value: "" }],
  });

  const [imageFile, setImageFile] = useState(null);

  // ✅ Load existing About data
  useEffect(() => {
    loadAbout();
  }, []);

  async function loadAbout() {
    try {
      const res = await fetch("/api/admin/about");
      const data = await res.json();

      if (data?.about) {
        setForm({
          title: data.about.title || "",
          subtitle: data.about.subtitle || "",
          description: data.about.description || "",
          stats: data.about.stats?.length ? data.about.stats : [{ label: "", value: "" }],
          image: data.about.image || { url: "" },
        });
      }
    } catch (err) {
      console.error("Failed to load:", err);
    }
  }

  // ✅ Submit Form
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("data", JSON.stringify(form));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Saved successfully!");
        loadAbout();
      } else {
        alert("Error saving data");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ✅ Add stat row
  function addStat() {
    setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] });
  }

  // ✅ Update stat
  function updateStat(i, key, value) {
    const newStats = [...form.stats];
    newStats[i][key] = value;
    setForm({ ...form, stats: newStats });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Manage About Section</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6 max-w-2xl">
        
        {/* Title */}
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 w-full"
          placeholder="Title"
        />

        {/* Subtitle */}
        <input
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="border p-2 w-full"
          placeholder="Subtitle"
        />

        {/* Description */}
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 w-full h-32"
          placeholder="Description"
        />

        {/* Current Image */}
        {form.image?.url && (
          <img
            src={form.image.url}
            alt="about"
            className="w-40 h-40 object-cover rounded"
          />
        )}

        {/* Upload new image */}
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files?.[0])}
          className="border p-2 w-full"
        />

        {/* Stats */}
        <div>
          <label className="font-semibold text-lg block mb-2">
            Stats (Label + Value)
          </label>

          {form.stats.map((s, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <input
                value={s.label}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                placeholder="Label"
                className="border p-2 w-full"
              />
              <input
                value={s.value}
                onChange={(e) => updateStat(i, "value", e.target.value)}
                placeholder="Value"
                className="border p-2 w-full"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addStat}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            + Add More
          </button>
        </div>

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
          type="submit"
        >
          Save
        </button>
      </form>
    </div>
  );
}
