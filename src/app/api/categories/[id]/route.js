import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🟢 GET -> Single category
export async function GET(req, { params }) {
  try {
    await connectDB();
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, category });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🟡 PUT -> Update category
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const formData = await req.formData();
    const updateData = JSON.parse(formData.get("data"));

    // Upload image directly to Cloudinary
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

    const updatedCategory = await Category.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🔴 DELETE -> Remove category
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const deleted = await Category.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    // Optional: Delete image from Cloudinary
    if (deleted.image?.public_id) {
      cloudinary.uploader.destroy(deleted.image.public_id).catch((err) => {
        console.error("Failed to delete image from Cloudinary:", err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
