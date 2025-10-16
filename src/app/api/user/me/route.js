import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();
  try {
    // Placeholder: replace with actual user session logic
    const user = await User.findOne({ email: "test@example.com" });
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
