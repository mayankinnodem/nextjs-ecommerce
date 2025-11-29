import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    // Fetch user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Fetch cart from user (assuming you store cart IDs or you can send via query)
    // For example, if user has a 'cart' field with product IDs + quantities
    const cartItems = user.cart || []; // [{ productId, quantity }]

    // Fetch full product details
    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Merge products with cart quantities
    const items = cartItems.map((cItem) => {
      const product = products.find((p) => p._id.toString() === cItem.productId.toString());
      return {
        _id: product._id,
        name: product.name,
        images: product.images,
        price: product.price,
        quantity: cItem.quantity,
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal > 0 ? 99 : 0;
    const total = subtotal + shipping;

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        phone: user.phone,
        street: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
      items,
      subtotal,
      shipping,
      total,
    });
  } catch (error) {
    console.error("Checkout Data Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
