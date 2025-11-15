import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Slug helper
const slugify = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ✅ Upload buffer → Cloudinary
async function uploadToCloudinary(fileBuffer, folder = "products") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(fileBuffer);
  });
}

/* ===========================
 ✅ GET → Single Product
=========================== */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);

    if (!product)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* ===========================
 ✅ PUT → Update Product
=========================== */
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const formData = await req.formData();
    const productData = JSON.parse(formData.get("data"));

    // ✅ Generate slug if name changed
    if (productData.name) {
      productData.slug = slugify(productData.name);
    }

    // ✅ sale price auto
    const price = Number(productData.price) || 0;
    const discount = Number(productData.discount) || 0;
    productData.salePrice = price - (price * discount) / 100;

    // ✅ tags string → array
    if (productData.tags && typeof productData.tags === "string") {
      productData.tags = productData.tags.split(",").map((t) => t.trim());
    }

    // ✅ Fetch existing
    const existingProduct = await Product.findById(params.id);

    if (!existingProduct)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );

    /* =========================
      ✅ Image Handling
    ========================== */

    // Incoming reference URLs (keep)
    const existingImages = JSON.parse(formData.get("existingImages") || "[]");

    // Delete removed images from Cloudinary
    const imagesToDelete = existingProduct.images.filter(
      (img) => !existingImages.includes(img.url)
    );

    for (const img of imagesToDelete) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    // ✅ New image upload
    const newFiles = formData.getAll("images");
    const newImages = [];

    for (const file of newFiles) {
      if (file && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await uploadToCloudinary(buffer, "products");
        newImages.push({ url: upload.secure_url, public_id: upload.public_id });
      }
    }

    // ✅ Final Image Array
    productData.images = [
      ...existingProduct.images.filter((img) =>
        existingImages.includes(img.url)
      ),
      ...newImages,
    ];

    // ✅ Update and return
    const updated = await Product.findByIdAndUpdate(params.id, productData, {
      new: true,
    });

    return NextResponse.json({ success: true, product: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* ===========================
 ✅ DELETE → Remove Product
=========================== */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const existingProduct = await Product.findById(params.id);
    if (!existingProduct)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );

    // ✅ Delete Cloudinary media
    for (const img of existingProduct.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
