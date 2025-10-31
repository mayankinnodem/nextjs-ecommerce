import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone and OTP are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // ✅ Validate OTP (allow master OTP for testing)
    const validOtp = phone === "9999999999" ? "999999" : user.otp;
    if (otp !== validOtp || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 401 }
      );
    }

    // ✅ Generate JWT token (7 days)
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Store the token in DB for single-device login enforcement
    user.authToken = token;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // ✅ Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        dob: user.dob || "",
        maritalStatus: user.maritalStatus || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        country: user.country || "",
        occupation: user.occupation || "",
        company: user.company || "",
        profilePic: user.profilePic?.url || "",
      },
    });

    // ✅ Securely set cookie using NextResponse API
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
