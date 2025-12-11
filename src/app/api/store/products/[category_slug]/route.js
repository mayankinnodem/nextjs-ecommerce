import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // ⭐ Next.js v15 requires awaiting params
    const { category_slug } = await params;

    if (!category_slug) {
      return NextResponse.json(
        { success: false, message: "Category slug missing" },
        { status: 400 }
      );
    }

    // 🔍 Find Category by slug
    const category = await Category.findOne({ slug: category_slug }).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // 📌 Fetch products of that category only
    const products = await Product.find({ category: category._id })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Category Products API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
