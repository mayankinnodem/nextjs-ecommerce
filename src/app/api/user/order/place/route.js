import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, address, items, paymentMode } = await req.json();

    if (!userId || !items?.length) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    // Fix 1 — Calculate Correct Total
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Fix 2 — Expected Delivery
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    // Fix 3 — Final Address
    const shippingAddress = {
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };

    // Fix 4 — Create Order
    const order = await Order.create({
      userId,
      address: shippingAddress,
      items,
      totalAmount,
      paymentMode: paymentMode || "COD",
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
