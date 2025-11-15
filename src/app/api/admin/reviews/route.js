import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";
import Review from "@/models/Review";

// 🔹 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================================
// 📌 GET → Get All Reviews
// ======================================
export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ======================================
// 📌 POST → Create Review
// ======================================
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const rawData = formData.get("data");

    if (!rawData) {
      return NextResponse.json(
        { success: false, error: "No review data provided" },
        { status: 400 }
      );
    }

    const reviewData = JSON.parse(rawData);
    let photoUrl = null;

    const file = formData.get("photo");

    // 🔥 Upload image if exists
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "reviews" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      photoUrl = uploaded.secure_url;
    }

    // Add photo url if uploaded
    if (photoUrl) reviewData.photo = photoUrl;

    const newReview = await Review.create(reviewData);

    return NextResponse.json({ success: true, review: newReview });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
