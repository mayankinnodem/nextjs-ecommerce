import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload buffer to Cloudinary
async function uploadToCloudinary(fileBuffer, folder = "products") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find()
      .populate("category", "name slug")   // ✅ YAHI MAIN FIX HAI
      .sort({ createdAt: -1 });

    const LOW_STOCK_LIMIT = 5;
    const lowStockProducts = products.filter(
      (p) => (p.stock ?? 0) < LOW_STOCK_LIMIT
    );

    return NextResponse.json(
      {
        success: true,
        products,
        total: products.length,
        lowStock: lowStockProducts.length,
        lowStockProducts
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}



// ✅ POST -> Add product (without video)
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    // Parse product JSON
    const productData = JSON.parse(formData.get("data")); // "data" is JSON string

    // Upload images (max 5)
    const files = formData.getAll("images");
    const imageUrls = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const url = await uploadToCloudinary(buffer, "products");
      imageUrls.push(url);
    }

    // Auto-calculate sale price if discount exists
    if (productData.price && productData.discount) {
      productData.salePrice =
        productData.price - (productData.price * productData.discount) / 100;
    }

    // Convert tags string -> array
    if (productData.tags && typeof productData.tags === "string") {
      productData.tags = productData.tags.split(",").map((t) => t.trim());
    }

    // Add Cloudinary media URLs
    productData.images = imageUrls;

    // Save to MongoDB
    const product = await Product.create(productData);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
