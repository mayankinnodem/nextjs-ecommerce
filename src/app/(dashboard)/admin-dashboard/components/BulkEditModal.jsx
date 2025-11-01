"use client";
import { useState, useEffect } from "react";

export default function BulkEditModal({
  open,
  onClose,
  selected,
  onUpdateSuccess,
}) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [form, setForm] = useState({
    brand: "",
    category: "",
    price: "",
    discount: "",
    stock: "",
    isTrending: false,
    isFeatured: false,
    isNewArrival: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [brandRes, catRes] = await Promise.all([
        fetch("/api/brand"),
        fetch("/api/categories"),
      ]);

      const [brandData, catData] = await Promise.all([
        brandRes.json(),
        catRes.json(),
      ]);

      if (brandData.success) setBrands(brandData.brands);
      if (catData.success) setCategories(catData.categories);
    };

    loadData();
  }, []);

  const handleBulkUpdate = async () => {
    setLoading(true);
    try {
      const updateData = {};

      Object.keys(form).forEach((key) => {
        if (form[key] !== "" && form[key] !== null) {
          updateData[key] = form[key];
        }
      });

      const res = await fetch("/api/products/bulk-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selected,
          updateData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Bulk Updated");
        onUpdateSuccess();
        onClose();
      } else alert("❌ " + data.error);
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white w-96 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Bulk Edit</h2>

        {/* CATEGORY */}
        <label className="block mb-1 font-medium">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border w-full px-3 py-2 mb-3"
        >
          <option value="">Skip</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* BRAND */}
        <label className="block mb-1 font-medium">Brand</label>
        <select
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="border w-full px-3 py-2 mb-3"
        >
          <option value="">Skip</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        {/* PRICE */}
        <label className="block mb-1 font-medium">Price</label>
        <input
          type="number"
          value={form.price}
          placeholder="Skip"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border w-full px-3 py-2 mb-3"
        />

        {/* DISCOUNT */}
        <label className="block mb-1 font-medium">Discount (%)</label>
        <input
          type="number"
          value={form.discount}
          placeholder="Skip"
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          className="border w-full px-3 py-2 mb-3"
        />

        {/* STOCK */}
        <label className="block mb-1 font-medium">Stock</label>
        <input
          type="number"
          placeholder="Skip"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="border w-full px-3 py-2 mb-3"
        />

        {/* FLAGS */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Flags</label>

          <label className="mr-3">
            <input
              type="checkbox"
              checked={form.isTrending}
              onChange={(e) =>
                setForm({ ...form, isTrending: e.target.checked })
              }
            />
            Trending
          </label>

          <label className="mr-3">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />
            Featured
          </label>

          <label className="mr-3">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) =>
                setForm({ ...form, isNewArrival: e.target.checked })
              }
            />
            New Arrival
          </label>
        </div>

        <button
          disabled={loading}
          onClick={handleBulkUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Updating..." : "Apply"}
        </button>

        <button
          className="mt-2 text-gray-500 w-full"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
