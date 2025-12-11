import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectDB();
    const { orderId, status, cancelReason } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ❗ NOW ADMIN CAN CHANGE ANYTHING (NO STATUS BLOCK)
    order.status = status;

    // ⭐ If admin cancels → reason required
    if (status === "Cancelled by Admin") {
      order.cancelReason = cancelReason || "No reason provided";
      order.paymentStatus = "Refund Initiated";
    }

    // ⭐ If moving from cancel to active, clear cancelReason
    if (!status.includes("Cancelled")) {
      order.cancelReason = "";
    }

    // ⭐ ETA Auto logic still valid
    if (status === "Shipped") {
      const d = new Date();
      d.setDate(d.getDate() + 4);
      order.expectedDelivery = d;
    }

    if (status === "Out for Delivery") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      order.expectedDelivery = d;
    }

    // ⭐ Completed means payment done
    if (status === "Completed") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
