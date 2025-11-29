// /app/api/user/order/user-orders/route.js
import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectDB } from "@/lib/dbConnect";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ success: false, message: "UserId missing" });
  }

  try {
    // ✅ Populate product details inside items
    const orders = await Order.find({ userId }).populate("items.productId");

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
