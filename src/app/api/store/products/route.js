import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";
import { jsonResponse, handleOptions, getCorsHeaders } from "@/lib/apiHelpers";

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

// Handle CORS preflight
export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req) {
  try {
    await connectDB();

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    // Limit max to 100 to prevent excessive data transfer (mobile app optimization)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const priceRange = searchParams.get("priceRange") || "";
    const sort = searchParams.get("sort") || "default";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isTrending = searchParams.get("isTrending");
    const isFeatured = searchParams.get("isFeatured");
    const isNewArrival = searchParams.get("isNewArrival");

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({ slug: category }).lean();
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Add flag filters
    if (isTrending === "true") {
      query.isTrending = true;
    }
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    if (isNewArrival === "true") {
      query.isNewArrival = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    } else if (priceRange && priceRange !== "all") {
      if (priceRange === "under5k") {
        query.price = { $lt: 5000 };
      } else if (priceRange === "5kTo20k") {
        query.price = { $gte: 5000, $lte: 20000 };
      } else if (priceRange === "above20k") {
        query.price = { $gt: 20000 };
      }
    }

    // Build sort
    let sortQuery = { createdAt: -1 };
    if (sort === "lowToHigh") sortQuery = { price: 1 };
    if (sort === "highToLow") sortQuery = { price: -1 };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Optimize: Only calculate lowStock if explicitly requested (reduces DB queries)
    const includeLowStock = searchParams.get("includeLowStock") === "true";
    
    // Get total count for pagination (only if needed for pagination)
    const total = page > 1 || includeLowStock ? await Product.countDocuments(query) : 0;

    // Fetch products with pagination, lean, and field selection
    const products = await Product.find(query)
      .select("name slug price salePrice discount images stock isTrending isFeatured isNewArrival category brand createdAt")
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate low stock only if requested (reduces unnecessary DB query)
    let lowStockCount = 0;
    if (includeLowStock) {
      const LOW_STOCK_LIMIT = 5;
      lowStockCount = await Product.countDocuments({
        ...query,
        $or: [
          { stock: { $lt: LOW_STOCK_LIMIT } },
          { stock: { $exists: false } }
        ]
      });
    }

    // Dynamic cache based on query type
    const isSearch = search || category || priceRange || isTrending || isFeatured || isNewArrival;
    const cacheControl = isSearch 
      ? 'public, s-maxage=30, stale-while-revalidate=60' // Shorter cache for filtered results
      : 'public, s-maxage=60, stale-while-revalidate=120'; // Longer cache for general listings

    return jsonResponse(
      {
        success: true,
        products,
        ...(total > 0 && { total, totalPages: Math.ceil(total / limit) }),
        page,
        limit,
        ...(includeLowStock && { lowStock: lowStockCount })
      },
      200,
      {
        'Cache-Control': cacheControl
      }
    );
  } catch (error) {
    console.error("Products API Error:", error);
    return jsonResponse(
      { success: false, error: error.message },
      500
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

    return jsonResponse({ success: true, product }, 201);
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return jsonResponse(
      { success: false, error: error.message },
      500
    );
  }
}
