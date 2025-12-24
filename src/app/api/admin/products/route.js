import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
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

export async function GET(req) {
  try {
    await connectDB();
    
    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    // Limit max to 100 to prevent excessive data transfer
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count
    const total = await Product.countDocuments(query);

    // Fetch products with pagination, lean, and field selection (reduces data transfer)
    const products = await Product.find(query)
      .select("name slug price salePrice discount images stock isTrending isFeatured isNewArrival category brand createdAt description")
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate low stock only if needed (optimize DB queries)
    const includeLowStock = searchParams.get("includeLowStock") === "true";
    let lowStock = 0;
    if (includeLowStock) {
      const LOW_STOCK_LIMIT = 5;
      lowStock = await Product.countDocuments({
        $or: [
          { stock: { $lt: LOW_STOCK_LIMIT } },
          { stock: { $exists: false } }
        ]
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        products, 
        total, 
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        ...(includeLowStock && { lowStock })
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate' // Admin data should not be cached
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
