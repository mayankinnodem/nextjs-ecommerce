import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";
import Banner from "@/models/Sections";

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ✅ GET → All Banners
export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, banners });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}