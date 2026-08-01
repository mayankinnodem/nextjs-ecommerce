import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { jsonResponse } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = (searchParams.get("orderId") || "").trim();

    if (!orderId) {
      return jsonResponse(
        { success: false, message: "Order ID is required" },
        400
      );
    }

    await connectDB();

    let order = null;

    if (/^[a-f\d]{24}$/i.test(orderId)) {
      order = await Order.findById(orderId).lean();
    }

    if (!order) {
      const orders = await Order.find().select("_id status expectedDelivery createdAt").lean();
      order = orders.find((o) =>
        o._id.toString().toLowerCase().endsWith(orderId.toLowerCase())
      );
    }

    if (!order) {
      return jsonResponse(
        { success: false, message: "Order not found" },
        404
      );
    }

    return jsonResponse({
      success: true,
      status: order.status,
      orderId: order._id.toString(),
      expectedDelivery: order.expectedDelivery || null,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Track order error:", error);
    return jsonResponse(
      { success: false, message: "Something went wrong" },
      500
    );
  }
}
