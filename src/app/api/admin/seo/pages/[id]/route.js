import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import { requireAdminAuth } from "@/lib/authHelpers";
import { revalidatePath } from "next/cache";
import { parseStructuredDataText } from "@/lib/seoSchema";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const page = await PageSeo.findById(id).lean();
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const PUT = requireAdminAuth(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;
    const formData = await req.formData();
    const raw = JSON.parse(formData.get("data") || "{}");

    const data = { ...raw };
    delete data.label;
    delete data.path;

    if ("structuredDataText" in data) {
      try {
        data.structuredData = parseStructuredDataText(data.structuredDataText);
      } catch (err) {
        return NextResponse.json(
          { success: false, error: err.message || "Invalid JSON-LD schema" },
          { status: 400 }
        );
      }
      delete data.structuredDataText;
    }

    const file = formData.get("ogImage");
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
      data.ogImage = imageData;
    }

    const updated = await PageSeo.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    revalidatePath(updated.path);
    revalidatePath("/");

    return NextResponse.json({ success: true, page: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});
