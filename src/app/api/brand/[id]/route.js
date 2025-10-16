import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";
import Brand from "@/models/Brand";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🟢 GET -> Single Brand
export async function GET(req, { params }) {
  try {
    await connectDB();
    const brand = await Brand.findById(params.id);
    if (!brand) {
      return NextResponse.json({ success: false, error: "brand not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, brand });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🟡 PUT -> Update brand
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
          { folder: "brands" },
          (err, result) => {
            if (err) reject(err);
            else resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(buffer);
      });
      updateData.image = imageData;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updatedBrand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, brand: updatedBrand });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🔴 DELETE -> Remove brand
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const deleted = await Brand.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
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
