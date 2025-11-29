import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const { orderId, status } = await req.json();
    await connectDB();

    await Order.findByIdAndUpdate(orderId, { status });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
