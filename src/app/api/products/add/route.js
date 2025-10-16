import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

// ✅ Ensure it runs in Node.js (not Edge)
export const runtime = "nodejs";

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Helper to upload image buffer to Cloudinary
async function uploadToCloudinary(buffer, folder = "products") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export const POST = async (req) => {
  try {
    // ✅ Connect to DB
    await connectDB();

    // ✅ Parse FormData
    const formData = await req.formData();
    const data = JSON.parse(formData.get("data"));

    // ✅ Create new product object
    const product = new Product({
      name: data.name,
      description: data.description || "",
      category: data.category,
      subCategory: data.subCategory || "",
      brand: data.brand || "",
      gender: data.gender || "Unisex",
      price: Number(data.price) || 0,
      discount: Number(data.discount) || 0,
      salePrice: data.salePrice
        ? Number(data.salePrice)
        : Number(data.price) || 0,
      stock: Number(data.stock) || 0,
      minOrder: Number(data.minOrder) || 1,
      attributes: data.attributes || [], // ✅ Added missing field
      tags:
        typeof data.tags === "string"
          ? data.tags.split(",").map((t) => t.trim())
          : data.tags || [],
      images: [],
      isTrending: !!data.isTrending,
      isFeatured: !!data.isFeatured,
      isNewArrival: !!data.isNewArrival,
      season: data.season || "All",
      status: data.status || "active",
      publishDate: data.publishDate ? new Date(data.publishDate) : Date.now(),
    });

    // ✅ Upload all images to Cloudinary
    const images = formData.getAll("images");

    for (const img of images) {
      const arrayBuffer = await img.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToCloudinary(buffer, "products");

      product.images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // ✅ Save to DB
    await product.save();

    // ✅ Return success
    return new Response(
      JSON.stringify({ success: true, product }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("❌ Failed to add product:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
