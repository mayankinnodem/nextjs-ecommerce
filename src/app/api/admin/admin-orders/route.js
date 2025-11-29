import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";

// GET ALL ORDERS (with populated product)
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find()
      .populate("items.productId") // ✅ IMPORTANT
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Get Admin Orders Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// UPDATE ORDER STATUS
export async function PATCH(req) {
  try {
    await connectDB();

    const { orderId, status } = await req.json();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("❌ Update Status Error:", err);
    return NextResponse.json(
      { success: false, message: "Status update failed" },
      { status: 500 }
    );
  }
}
