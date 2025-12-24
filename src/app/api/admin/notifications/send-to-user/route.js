import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { jsonResponse, handleOptions } from "@/lib/apiHelpers";

export async function OPTIONS() {
  return handleOptions();
}

// POST - Admin se user ko notification send karega
export async function POST(req) {
  try {
    await connectDB();
    
    const { userId, userIds, title, message, type, priority, relatedId, relatedType, actionUrl } = await req.json();
    
    if (!title || !message) {
      return jsonResponse(
        { success: false, message: "Title and message are required" },
        400
      );
    }
    
    // Single user ya multiple users
    const targetUserIds = userIds && userIds.length > 0 ? userIds : (userId ? [userId] : []);
    
    if (targetUserIds.length === 0) {
      return jsonResponse(
        { success: false, message: "At least one user ID is required" },
        400
      );
    }
    
    // Validate users exist
    const users = await User.find({ _id: { $in: targetUserIds } });
    if (users.length !== targetUserIds.length) {
      return jsonResponse(
        { success: false, message: "Some users not found" },
        400
      );
    }
    
    // Create notifications for each user
    const notifications = await Notification.insertMany(
      targetUserIds.map(uid => ({
        userId: uid,
        title,
        message,
        type: type || "info",
        priority: priority || "medium",
        relatedId,
        relatedType,
        actionUrl,
        isRead: false,
      }))
    );
    
    // ✅ REMOVED: Admin notification creation - ab sirf user notifications create honge
    
    return jsonResponse({
      success: true,
      message: `Notification sent to ${notifications.length} user(s)`,
      notifications,
    }, 201);
  } catch (error) {
    console.error("Send User Notification Error:", error);
    return jsonResponse(
      { success: false, error: error.message },
      500
    );
  }
}
