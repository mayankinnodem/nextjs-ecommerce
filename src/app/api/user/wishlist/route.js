// /src/app/api/user/wishlist/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

// ✅ Add / Remove product in wishlist
export async function POST(req) {
  try {
    await connectDB();

    const { phone, product } = await req.json();
    if (!phone || !product?._id) {
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // ✅ Ensure wishlist is always an array
    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    // ✅ Check if product already exists
    const exists = user.wishlist.some((item) => item._id.toString() === product._id.toString());

    if (exists) {
      // Remove if already exists
      user.wishlist = user.wishlist.filter((item) => item._id.toString() !== product._id.toString());
    } else {
      // Add new product
      user.wishlist.push(product);
    }

    await user.save();
    return NextResponse.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error("❌ Wishlist Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ✅ Get user wishlist
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone missing" }, { status: 400 });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // ✅ Ensure wishlist is array
    const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];

    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    console.error("❌ Wishlist GET Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
