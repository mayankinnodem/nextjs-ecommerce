import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Brand from "@/models/Brand"; // ✅ REQUIRED FOR populate
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { category_slug } = await params;

    if (!category_slug) {
      return NextResponse.json(
        { success: false, message: "Category identifier missing" },
        { status: 400 }
      );
    }

    let category = null;

    if (mongoose.Types.ObjectId.isValid(category_slug)) {
      category = await Category.findById(category_slug).lean();
    }

    if (!category) {
      category = await Category.findOne({ slug: category_slug }).lean();
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const products = await Product.find({ category: category._id })
      .populate("category", "name slug")
      .populate("brand", "name slug") // ✅ now works
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
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
