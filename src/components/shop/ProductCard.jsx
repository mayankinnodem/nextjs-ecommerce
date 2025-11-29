"use client";
import Link from "next/link";

export default function ProductCard({ product }) {
  const categorySlug = product?.category?.slug || "unknown";
  const productSlug = product?.slug || "product";
  const image = product?.images?.[0]?.url || "/placeholder.png";

  // ✅ Add to Cart Function
  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(item => item._id === product._id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart ✅");
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white">

      <Link href={`/${categorySlug}/${productSlug}`}>
        <img
          src={image}
          alt={product?.name}
          className="w-full h-56 object-cover"
        />
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/${categorySlug}/${productSlug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500">
          ₹{product.price}
        </p>

        {/* ✅ Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Add to Cart
        </button>
      </div>

    </div>
  );
}
