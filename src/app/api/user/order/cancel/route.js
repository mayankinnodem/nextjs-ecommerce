import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { orderId, userId, reason } = await req.json();

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return NextResponse.json({
        success: false,
        message: "Order cancellation not allowed",
      });
    }

    order.status = "Cancelled by User";
    order.cancelReason = reason; // ⭐ Save reason
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled" });
  } catch (err) {
    console.log("Cancel Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
