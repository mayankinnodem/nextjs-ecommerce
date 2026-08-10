import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import PageSeo from "@/models/PageSeo";
import { requireAdminAuth } from "@/lib/authHelpers";
import { revalidatePath } from "next/cache";
import { parseStructuredDataText } from "@/lib/seoSchema";
import { normalizeSeoPath, isValidSeoPath } from "@/lib/seoPath";
import { deleteCustomPageSeo, mirrorPageSeoToEntity } from "@/lib/seoSync";
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

    const existing = await PageSeo.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    const data = { ...raw };

    // Custom pages: allow path & label edit
    if (existing.isCustom || existing.pageType === "custom") {
      if (raw.path) {
        const newPath = normalizeSeoPath(raw.path);
        if (!isValidSeoPath(newPath)) {
          return NextResponse.json(
            { success: false, error: "Invalid path format" },
            { status: 400 }
          );
        }
        const conflict = await PageSeo.findOne({ path: newPath, _id: { $ne: id } });
        if (conflict) {
          return NextResponse.json(
            { success: false, error: "Another page already uses this path" },
            { status: 400 }
          );
        }
        data.path = newPath;
      }
      if (raw.label) data.label = raw.label.trim();
    } else {
      delete data.label;
      delete data.path;
    }

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

    await mirrorPageSeoToEntity(updated.toObject?.() || updated);

    return NextResponse.json({ success: true, page: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});

export const DELETE = requireAdminAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const page = await deleteCustomPageSeo(id);
    revalidatePath(page.path);
    return NextResponse.json({ success: true, message: "Custom page deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
});
