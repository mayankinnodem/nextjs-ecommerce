import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/dbConnect";
import Category from "@/models/Category";
import { slugify } from "@/lib/slugify";
import { revalidateCategoryPages } from "@/lib/revalidateHelper";
import { normalizeSeoBlock } from "@/lib/seoSchema";

function normalizeCategoryUpdate(data) {
  const normalized = { ...data };
  const name = normalized.name?.trim();

  if (!normalized.slug?.trim()) {
    normalized.slug = slugify(name);
  } else {
    normalized.slug = slugify(normalized.slug);
  }

  if (!normalized.slug) {
    throw new Error("Category slug is required");
  }

  if (normalized.seo) {
    try {
      normalized.seo = normalizeSeoBlock(normalized.seo);
    } catch (err) {
      throw new Error(err.message || "Invalid category SEO schema JSON");
    }
  }

  return normalized;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET -> Single category
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ PUT -> Update category
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const existing = await Category.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const updateData = normalizeCategoryUpdate(JSON.parse(formData.get("data")));

    const file = formData.get("image");
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const imageData = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "categories" },
          (err, result) => {
            if (err) reject(err);
            else resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(buffer);
      });

      updateData.image = imageData;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    await revalidateCategoryPages(updatedCategory);
    if (existing.slug && existing.slug !== updatedCategory.slug) {
      await revalidateCategoryPages({ slug: existing.slug });
    }

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ DELETE -> Remove category
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    if (deleted.image?.public_id) {
      cloudinary.uploader.destroy(deleted.image.public_id).catch((err) => {
        console.error("Cloudinary deletion failed:", err);
      });
    }

    await revalidateCategoryPages(deleted);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}