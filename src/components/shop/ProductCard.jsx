"use client";

import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ Always use MongoDB _id
  const productId = product._id;

  // Check if product is wishlisted
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsWishlisted(wishlist.some((item) => item._id === productId));
  }, [productId]);

  // Toggle wishlist
  const toggleWishlist = async () => {
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const index = wishlist.findIndex((item) => item._id === productId);

      if (index !== -1) {
        wishlist.splice(index, 1);
        setIsWishlisted(false);
      } else {
        wishlist.push({ _id: productId, name: product.name, price: product.price, images: product.images });
        setIsWishlisted(true);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      // Update backend if user logged in
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?._id) {
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            product: { _id: productId, name: product.name, price: product.price, images: product.images },
          }),
        });
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find((item) => item._id === productId);

      if (existing) existing.quantity += 1;
      else cart.push({ _id: productId, ...product, quantity: 1 });

      localStorage.setItem("cart", JSON.stringify(cart));
      alert("✅ Added to cart!");
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  return (
    <div className="relative border rounded-lg shadow hover:shadow-lg transition overflow-hidden bg-white">
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white"
      >
        <FaHeart
          className={`text-2xl transition ${isWishlisted ? "text-red-500" : "text-transparent border border-black rounded-full"}`}
          style={{ WebkitTextStroke: isWishlisted ? "none" : "1px black" }}
        />
      </button>

      <img src={product.images?.[0]?.url || "/placeholder.png"} alt={product.name} className="w-full h-48 object-cover" />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600">₹{Number(product.price).toLocaleString()}</p>
        {product.discount > 0 && (
          <p className="text-sm text-green-600">
            {product.discount}% off – Sale: ₹{product.salePrice}
          </p>
        )}

        <button onClick={handleAddToCart} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
