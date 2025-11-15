"use client";

import { useEffect, useState } from "react";

export default function BannerAdminPage() {
  const [banners, setBanners] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    title: "",
    subtitle: "",
    section: "",
    buttonText1: "",
    buttonText2: "",
    image: null,
  });

  const fetchBanners = async () => {
    const res = await fetch("/api/admin/sections");
    const data = await res.json();
    setBanners(data?.banners || []);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("data", JSON.stringify(form));
    if (form.image) fd.append("image", form.image);

    const endpoint = form._id
      ? `/api/admin/sections/${form._id}`
      : `/api/admin/sections`;

    await fetch(endpoint, {
      method: form._id ? "PUT" : "POST",
      body: fd,
    });

    setOpen(false);
    resetForm();
    fetchBanners();
  };

  const resetForm = () => {
    setForm({
      _id: null,
      title: "",
      subtitle: "",
      section: "",
      buttonText1: "",
      buttonText2: "",
      image: null,
    });
  };

  const handleDelete = async (id) => {
    await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    fetchBanners();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Banner Management</h1>

      <div className="border rounded-lg shadow p-4">
        <div className="p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Banners</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setOpen(true)}
            >
              Add Banner
            </button>
          </div>

          {open && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                <h2 className="text-xl font-semibold">
                  {form._id ? "Edit Banner" : "Add Banner"}
                </h2>

                <input
                  className="border p-2 w-full"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <input
                  className="border p-2 w-full"
                  placeholder="Subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />

                <input
  type="text"
  value={form.section}
  disabled
  className="border p-2 w-full bg-gray-200 text-gray-500 cursor-not-allowed"
/>


                <input
                  className="border p-2 w-full"
                  placeholder="Button 1"
                  value={form.buttonText1}
                  onChange={(e) =>
                    setForm({ ...form, buttonText1: e.target.value })
                  }
                />

                <input
                  className="border p-2 w-full"
                  placeholder="Button 2"
                  value={form.buttonText2}
                  onChange={(e) =>
                    setForm({ ...form, buttonText2: e.target.value })
                  }
                />

                <input
                  type="file"
                  className="border p-2 w-full"
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.files[0] })
                  }
                />

                <div className="flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LIST */}
          <div className="space-y-4">
            {banners?.length === 0 && <p>No banners found...</p>}

            {banners.map((b) => (
              <div
                key={b._id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-gray-600">{b.subtitle}</p>
                  <p className="text-sm text-gray-500">
                    Section: {b.section}
                  </p>
                </div>
                <div className="flex items-center">
                  {b.bannerUrl?.url && (
                    <img
                      src={b.bannerUrl.url}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  )}

                  <button
                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => {
                      setForm({
                        _id: b._id,
                        title: b.title,
                        subtitle: b.subtitle,
                        section: b.section,
                        buttonText1: b.buttonText1,
                        buttonText2: b.buttonText2,
                        image: null,
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="ml-2 px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
