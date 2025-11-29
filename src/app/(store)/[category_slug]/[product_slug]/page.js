import React from "react";

// ✅ FUNCTION MUST BE ABOVE COMPONENT
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

  const resolvedParams = await params; // ✅ Next 15 FIX
  const { category_slug, product_slug } = resolvedParams;

  const data = await getProduct(category_slug, product_slug);

  if (!data?.success) {
    return (
      <div className="container">
        <h2 className="text-center text-xl text-red-500 mt-10">
          Product Not Found
        </h2>
      </div>
    );
  }

  const product = data.product;

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div>
          {product?.images?.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="text-gray-600">No Image</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-500 mt-3">{product.description}</p>

          <div className="mt-5">
            <p className="text-2xl font-semibold">
              ₹{product.salePrice || product.price}
            </p>

            {product.discount > 0 && (
              <p className="text-gray-400 line-through">₹{product.price}</p>
            )}
          </div>

          <div className="mt-5">
            <p className="text-sm">Brand: {product?.brand?.name || "N/A"}</p>
            <p className="text-sm">Category: {product?.category?.name}</p>
            <p className="text-sm">Sub Category: {product?.subCategory}</p>
            <p className="text-sm">Gender: {product?.gender}</p>
            <p className="text-sm">Stock: {product?.stock}</p>
          </div>

          {product?.attributes?.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold">Attributes</h3>
              <ul className="list-disc ml-5">
                {product.attributes.map((attr, index) => (
                  <li key={index}>
                    {attr.name}: {attr.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="mt-6 px-6 py-3 bg-black text-white rounded-lg">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
