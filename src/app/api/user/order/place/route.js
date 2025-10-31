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

    // ✅ Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Prepare shipping address (fallback to user's default)
    const shippingAddress = {
      name: address?.name || user.name,
      phone: address?.phone || user.phone,
      street: address?.street || user.address,
      city: address?.city || user.city,
      state: address?.state || user.state,
      pincode: address?.pincode || user.pincode,
    };

    // ✅ Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // ✅ Expected delivery default 5 days
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    // ✅ Create order
const order = await Order.create({
  userId: user._id,
  userName: shippingAddress.name,
  userPhone: shippingAddress.phone,
  shippingAddress: shippingAddress,
  items: items.map(i => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  })),
  totalAmount,
  status: "Pending",
  paymentStatus: paymentMode === "Online" ? "Paid" : "Pending",
  paymentMode: paymentMode || "COD",
  expectedDelivery,
});



    // ✅ Optionally update user default address if different
    const isAddressChanged =
      shippingAddress.street !== user.address ||
      shippingAddress.city !== user.city ||
      shippingAddress.state !== user.state ||
      shippingAddress.pincode !== user.pincode;

    if (isAddressChanged) {
      user.address = shippingAddress.street;
      user.city = shippingAddress.city;
      user.state = shippingAddress.state;
      user.pincode = shippingAddress.pincode;
      await user.save();
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
