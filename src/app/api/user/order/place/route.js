import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";

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

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.log("Order Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
