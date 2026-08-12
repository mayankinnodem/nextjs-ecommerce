import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import SeoSettings from "@/models/SeoSettings";
import { requireAdminAuth } from "@/lib/authHelpers";
import { v2 as cloudinary } from "cloudinary";
import { resolveSiteDomain } from "@/lib/siteDatabase";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = requireAdminAuth(async (req) => {
  try {
    await connectDB(req);
    let settings = await SeoSettings.findOne();
    if (!settings) {
      settings = await SeoSettings.create({});
    }
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});

export const PUT = requireAdminAuth(async (req) => {
  try {
    await connectDB(req);
    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") || "{}");

    const domain = await resolveSiteDomain(req);
    if (domain) {
      data.domain = domain;
    }

    const file = formData.get("defaultOgImage");
    if (file && file.name && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const imageData = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "seo" },
          (err, result) => {
            if (err) reject(err);
            else resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(buffer);
      });
      data.defaultOgImage = imageData;
    }

    const settings = await SeoSettings.findOneAndUpdate({}, data, {
      upsert: true,
      new: true,
    });

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});
