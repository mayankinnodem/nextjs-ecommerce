import ProductCard from "@/components/shop/ProductCard";

export default async function CategoryPage({ params }) {
  const { category_slug } = params;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  // ⭐ Correct URL (dynamic slug)
  const res = await fetch(
    `${baseUrl}/api/store/products/${category_slug}`,
    { cache: "no-store" }
  );

  let products = [];

  if (res.ok) {
    const data = await res.json();
    products = data?.products || [];
  }

  return (
    <section className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold capitalize">
        {category_slug.replace(/-/g, " ")}
      </h1>

      {products.length === 0 ? (
        <p className="mt-10 text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category_slug={product?.category?.slug}
            />
          ))}
        </div>
      )}
    </section>
  );
}
