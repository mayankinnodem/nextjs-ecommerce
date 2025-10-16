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

// 🟢 GET -> All categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🟡 POST -> Add new category
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const categoryData = JSON.parse(formData.get("data"));

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
      categoryData.image = imageData;
    }

    const newCategory = await Category.create(categoryData);
    return NextResponse.json({ success: true, category: newCategory });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}