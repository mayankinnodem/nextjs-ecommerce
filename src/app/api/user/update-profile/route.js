import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { _id, ...updates } = body;

    // ✅ Validate
    if (!_id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // ✅ Update user by ID
    const user = await User.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true } // Return updated document
    ).select("-password");

    // ✅ Handle not found
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // ✅ Return success
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
