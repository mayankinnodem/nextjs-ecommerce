import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import { notifyAdmin } from "@/lib/notificationHelper";
import { notifyUser } from "@/lib/notificationHelper";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, address, items, paymentMode, totalAmount } = await req.json();

    if (!userId || !items?.length) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🔐 backend total verification (Prevents tampering)
    const verifiedTotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const shipping = verifiedTotal > 0 ? 99 : 0;
    const finalTotal = verifiedTotal + shipping;

    // 📅 Expected Delivery (5 days)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    const shippingAddress = {
      name: address.name,
      phone: address.phone,
      alternatePhone: address.alternatePhone || "",
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };

    const order = await Order.create({
      userId,
      address: shippingAddress,
      items,
      totalAmount: finalTotal, // always backend controlled
      paymentMode,
      paymentStatus: paymentMode === "Online" ? "Paid" : "Pending",
      status: "Pending",
      expectedDelivery,
    });

    // ✅ Auto notification to admin
    await notifyAdmin({
      title: "New Order Received",
      message: `New order #${order._id} placed by ${user.name || user.phone}. Total: ₹${finalTotal}`,
      type: "order",
      priority: "high",
      relatedId: order._id,
      relatedType: "order",
      actionUrl: `/admin-dashboard/orders/${order._id}`,
    });

    // ✅ Auto notification to user
    await notifyUser({
      userId: user._id,
      title: "Order Placed Successfully",
      message: `Your order #${order._id} has been placed successfully. Total: ₹${finalTotal}`,
      type: "order",
      priority: "medium",
      relatedId: order._id,
      relatedType: "order",
      actionUrl: `/user-dashboard/orders`,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.log("Order Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
