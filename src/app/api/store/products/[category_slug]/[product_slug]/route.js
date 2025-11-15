import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
  try {
    await connectDB();

    const { category_slug, product_slug } = params;

    // ✅ find category by slug
    const category = await Category.findOne({ slug: category_slug });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // ✅ product by slug + category
    const product = await Product.findOne({
      slug: product_slug,
      category: category._id,
    })
      .populate("category", "name slug")
      .populate("brand", "name")
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Product GET API error:", error);
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
