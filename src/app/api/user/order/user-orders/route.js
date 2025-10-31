import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone missing" }, { status: 400 });
    }

    const orders = await Order.find({ userPhone: phone }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Get User Orders Error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
