"use client";

import { useEffect, useState } from "react";

export default function ContactUsAdminPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    phone: "",
    email: "",
    address: "",
  });

  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewFavicon, setPreviewFavicon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch existing data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/contact-us");
        const data = await res.json();
        if (data.success && data.data) {
          setForm(data.data);
          setPreviewLogo(data.data.logo?.url || null);
          setPreviewFavicon(data.data.favicon?.url || null);
        }
      } catch (err) {
        console.error("Failed to load contact section:", err);
      }
    }
    loadData();
  }, []);

  // ✅ Input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Image change + live preview
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFavicon(file);
      setPreviewFavicon(URL.createObjectURL(file));
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(form));

      if (logo) formData.append("logo", logo);
      if (favicon) formData.append("favicon", favicon);

      const res = await fetch("/api/admin/contact-us/update", {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setMessage("✅ Contact section updated successfully!");
      } else {
        setMessage(`❌ Error: ${result.error || "Update failed"}`);
      }
    } catch (error) {
      setMessage("❌ Failed to update. Check console.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-800 rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-2">
        🛠️ Contact Section (Admin)
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* LEFT SIDE: Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              rows={4}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9999999999"
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="info@example.com"
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Sector 63, Noida, India"
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Images */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block mb-2 font-medium">Logo</label>

            {previewLogo && (
              <div className="mb-3 relative w-32">
                <img
                  src={previewLogo}
                  alt="Logo Preview"
                  className="w-32 h-32 object-contain border rounded-lg shadow-sm"
                />

                {/* ❌ Remove Button */}
                <button
                  type="button"
                  onClick={() => {
                    setLogo(null);
                    setPreviewLogo(null);
                    setForm((prev) => ({ ...prev, logo: null }));
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
               file:rounded file:border-0 file:text-sm file:font-semibold 
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Favicon Upload */}
          <div>
            <label className="block mb-2 font-medium">Favicon</label>

            {previewFavicon && (
              <div className="mb-3 relative w-16">
                <img
                  src={previewFavicon}
                  alt="Favicon Preview"
                  className="w-16 h-16 object-contain border rounded-lg shadow-sm"
                />

                {/* ❌ Remove Button */}
                <button
                  type="button"
                  onClick={() => {
                    setFavicon(null);
                    setPreviewFavicon(null);
                    setForm((prev) => ({ ...prev, favicon: null }));
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFaviconChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
               file:rounded file:border-0 file:text-sm file:font-semibold 
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
          >
            {loading ? "Updating..." : "💾 Save Changes"}
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm font-medium">{message}</p>
      )}
    </div>
  );
}
