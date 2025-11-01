// src/app/api/admin/products/[id]/route.js

import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload buffer to Cloudinary
async function uploadToCloudinary(fileBuffer, folder = "products") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

// 🟢 GET -> Single Product
export async function GET(req, { params }) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🟡 PUT -> Update Product (without video)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const formData = await req.formData();
    const productData = JSON.parse(formData.get("data"));

    // Upload new images
    const files = formData.getAll("images");
    const newImageUrls = [];
    for (const file of files) {
      if (file && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToCloudinary(buffer, "products");
        newImageUrls.push({ url }); // storing objects like schema
      }
    }

    // Calculate sale price
    if (productData.price && productData.discount) {
      productData.salePrice =
        productData.price - (productData.price * productData.discount) / 100;
    }

    // Tags string -> array
    if (productData.tags && typeof productData.tags === "string") {
      productData.tags = productData.tags.split(",").map((t) => t.trim());
    }

    // Merge existing + new media
    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    productData.images = [...(existingProduct.images || []), ...newImageUrls];

    // Save update
    const updated = await Product.findByIdAndUpdate(params.id, productData, { new: true });

    return NextResponse.json({ success: true, product: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 🔴 DELETE -> Remove Product
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
