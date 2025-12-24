import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { notifyUser } from "@/lib/notificationHelper";
import User from "@/models/User";

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

    // ✅ Auto notification to user when status changes
    const user = await User.findById(order.userId);
    if (user) {
      let message = `Your order #${orderId} status has been updated to: ${status}`;
      if (status === "Shipped") {
        message = `Your order #${orderId} has been shipped! Expected delivery: ${order.expectedDelivery?.toLocaleDateString()}`;
      } else if (status === "Completed") {
        message = `Your order #${orderId} has been delivered successfully!`;
      } else if (status === "Cancelled by Admin") {
        message = `Your order #${orderId} has been cancelled. Reason: ${cancelReason || "Not provided"}`;
      }

      await notifyUser({
        userId: user._id,
        title: "Order Status Updated",
        message,
        type: "order",
        priority: status.includes("Cancelled") ? "high" : "medium",
        relatedId: orderId,
        relatedType: "order",
        actionUrl: `/user-dashboard/orders`,
      });
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
