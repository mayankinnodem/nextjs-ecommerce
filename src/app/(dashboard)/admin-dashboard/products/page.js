// src/app/(dashboard)/admin-dashboard/products/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products"); // GET products
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("❌ Failed to fetch products:", data.error);
        }
      } catch (err) {
        console.error("⚠️ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/delete/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        // Remove deleted product from state
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert("❌ Failed to delete: " + data.error);
      }
    } catch (err) {
      console.error("⚠️ Error deleting product:", err);
      alert("⚠️ Error deleting product");
    }
  };

  if (loading) {
    return <p className="text-gray-700">Loading products...</p>;
  }

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

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={p._id} className="border-b text-gray-900">
                <td className="px-4 py-2">{index + 1}</td>

                {/* Product Image */}
<td className="px-4 py-2">
  {p.images && p.images.length > 0 ? (
    <img
      src={p.images[0]?.url || p.images[0]} // agar object hai to url, agar string hai to direct
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
                  <Link
                    href={`/admin-dashboard/products/edit/${p._id}`}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
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
