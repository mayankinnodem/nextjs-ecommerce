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


// ✅ POST → Create Banner
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const rawData = formData.get("data");

    if (!rawData) {
      return NextResponse.json(
        { success: false, error: "No banner data provided" },
        { status: 400 }
      );
    }

    const bannerData = JSON.parse(rawData);

    let imageData = null;
    const file = formData.get("image");

    // ✅ Upload image only if exists
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      imageData = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "banners" },
          (err, result) => {
            if (err) reject(err);
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        );
        uploadStream.end(buffer);
      });
    }

    if (imageData) bannerData.bannerUrl = imageData;

    const newBanner = await Banner.create(bannerData);

    return NextResponse.json({ success: true, banner: newBanner });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
