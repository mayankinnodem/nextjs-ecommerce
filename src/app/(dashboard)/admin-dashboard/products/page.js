// src/app/(dashboard)/admin-dashboard/products/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]); // Selected product IDs
  const [bulkFlags, setBulkFlags] = useState({
    isTrending: false,
    isFeatured: false,
    isNewArrival: false,
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle select/deselect products
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map((p) => p._id));
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selected.length === 0) {
      alert("❌ No products selected for bulk update!");
      return;
    }

    if (!confirm(`Update ${selected.length} products?`)) return;

    try {
      const res = await fetch("/api/products/bulk-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, flags: bulkFlags }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.updatedCount} products updated!`);
        // Refresh products
        const refreshed = await fetch("/api/products").then((r) => r.json());
        if (refreshed.success) setProducts(refreshed.products);
        setSelected([]);
      } else {
        alert("❌ Bulk update failed: " + data.error);
      }
    } catch (err) {
      console.error("Bulk update error:", err);
      alert("⚠️ Error during bulk update!");
    }
  };

  if (loading) return <p className="text-gray-700">Loading products...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Link
          href="/admin-dashboard/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      {/* Bulk Edit Controls */}
      <div className="mb-4 p-4 bg-gray-100 rounded flex flex-wrap gap-4 items-center">
        <label>
          <input
            type="checkbox"
            checked={bulkFlags.isTrending}
            onChange={(e) =>
              setBulkFlags({ ...bulkFlags, isTrending: e.target.checked })
            }
          />{" "}
          Trending
        </label>

        <label>
          <input
            type="checkbox"
            checked={bulkFlags.isFeatured}
            onChange={(e) =>
              setBulkFlags({ ...bulkFlags, isFeatured: e.target.checked })
            }
          />{" "}
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            checked={bulkFlags.isNewArrival}
            onChange={(e) =>
              setBulkFlags({ ...bulkFlags, isNewArrival: e.target.checked })
            }
          />{" "}
          New Arrival
        </label>

        <button
          onClick={handleBulkUpdate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Selected
        </button>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.length === products.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Flags</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={p._id} className="border-b text-gray-900">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(p._id)}
                    onChange={() => toggleSelect(p._id)}
                  />
                </td>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  {p.images?.[0]?.url || p.images?.[0] ? (
                    <img
                      src={p.images[0].url || p.images[0]}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">₹{p.salePrice || p.price}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2">
                  {p.isTrending && <span className="px-2 py-1 bg-purple-200 rounded mr-1 text-xs">Trending</span>}
                  {p.isFeatured && <span className="px-2 py-1 bg-yellow-200 rounded mr-1 text-xs">Featured</span>}
                  {p.isNewArrival && <span className="px-2 py-1 bg-green-200 rounded text-xs">New Arrival</span>}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/admin-dashboard/products/edit/${p._id}`}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this product?")) return;
                      await fetch(`/api/products/delete/${p._id}`, { method: "DELETE" });
                      setProducts((prev) => prev.filter((prod) => prod._id !== p._id));
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
