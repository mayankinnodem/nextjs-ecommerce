import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Sections from "@/models/Sections";
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ UPDATE SECTION
export async function PUT(req, context) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ IMPORTANT
    const formData = await req.formData();
    const rawData = formData.get("data");
    const sectionData = JSON.parse(rawData);

    let imageData = null;
    const file = formData.get("image");

    // ✅ If new image, upload to cloudinary
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      imageData = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: "sections" },
          (err, result) => {
            if (err) reject(err);
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        );
        upload.end(buffer);
      });

      sectionData.bannerUrl = imageData;
    }

    const updated = await Sections.findByIdAndUpdate(id, sectionData, {
      new: true
    });

    return NextResponse.json({ success: true, section: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE SECTION
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params; // ✅ IMPORTANT

    const section = await Sections.findById(id);

    if (!section) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    // ✅ Delete Cloudinary image
    if (section.bannerUrl?.public_id) {
      await cloudinary.uploader.destroy(section.bannerUrl.public_id);
    }

    await Sections.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Section Deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
