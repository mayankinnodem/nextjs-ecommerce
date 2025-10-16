// src/components/ProductCard.js
"use client";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white">
      {/* Image */}
      <img
        src={product.images?.[0]?.url || "/placeholder.png"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600">₹{product.price}</p>
        {product.discount > 0 && (
          <p className="text-sm text-green-600">
            {product.discount}% off – Sale Price: ₹{product.salePrice}
          </p>
        )}

        <button
          onClick={() => onAddToCart(product)}
          className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
