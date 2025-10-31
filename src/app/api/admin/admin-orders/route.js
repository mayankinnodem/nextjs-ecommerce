import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Get Admin Orders Error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
