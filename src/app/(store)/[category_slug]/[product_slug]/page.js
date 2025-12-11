import React from "react";
import ProductActions from "./ProductActions";
import SuggestedProducts from "@/components/shop/SuggestedProducts";

async function getProduct(category_slug, product_slug) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/store/products/${category_slug}/${product_slug}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function ProductPage({ params }) {
  const { category_slug, product_slug } = await params;

  const data = await getProduct(category_slug, product_slug);

  if (!data?.success) {
    return (
      <h2 className="text-center text-red-500 mt-10 text-xl font-semibold">
        Product Not Found
      </h2>
    );
  }

  const product = data.product;
  const price = product.salePrice || product.price;

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full rounded-xl shadow-md border"
        />

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>

          <p className="text-3xl font-bold text-indigo-700">₹{price}</p>

          {/* ⭐ Add to Wishlist + Add to Cart */}
          <ProductActions product={product} />
        </div>
      </div>

      {/* ⭐ Suggested Section */}
      <SuggestedProducts
        categorySlug={product.category?.slug}
        currentProductId={product._id}
      />
    </div>
  );
}
