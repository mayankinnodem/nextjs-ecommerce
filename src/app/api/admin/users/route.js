import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

// GET: list users with search & pagination
export async function GET(req) {
  try {
    await connectDB();
    const { search, page = 1, limit = 10 } = Object.fromEntries(req.nextUrl.searchParams);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query, {
      name: 1,
      email: 1,
      phone: 1,
      role: 1,
      profilePic: 1,   // 🔥 THIS FIX
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    return NextResponse.json({ success: true, users, total });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


// DELETE: delete a user
export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = Object.fromEntries(req.nextUrl.searchParams);

    if (!id) return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PATCH: update user role or info
export async function PATCH(req) {
  try {
    await connectDB();
    const { id, updates } = await req.json();
    if (!id || !updates) return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
