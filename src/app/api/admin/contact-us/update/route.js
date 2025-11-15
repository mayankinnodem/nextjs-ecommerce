import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/dbConnect";
import ContactSection from "@/models/ContactSection";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const jsonData = JSON.parse(formData.get("data"));
    let section = await ContactSection.findOne();

    if (!section) {
      section = new ContactSection(jsonData);
    } else {
      Object.assign(section, jsonData);
    }

    // ✅ LOGO (optional)
    const logo = formData.get("logo");
    if (logo && logo.name) {
      const buffer = Buffer.from(await logo.arrayBuffer());

      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "contact-section" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      section.logo = { url: uploaded.secure_url, public_id: uploaded.public_id };
    }

    // ✅ FAVICON (optional)
    const favicon = formData.get("favicon");
    if (favicon && favicon.name) {
      const buffer = Buffer.from(await favicon.arrayBuffer());

      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "contact-section" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      section.favicon = { url: uploaded.secure_url, public_id: uploaded.public_id };
    }

    await section.save();

    return NextResponse.json({ success: true, data: section });

  } catch (e) {
    console.log(e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
