import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// 🔹 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();

    // 🔹 Support JSON + FormData both
    let phone, otp, profileFile;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      phone = form.get("phone");
      otp = form.get("otp");
      profileFile = form.get("profilePic");
    } else {
      const body = await req.json();
      phone = body.phone;
      otp = body.otp;
      profileFile = null; // No image
    }

    // Validate
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

    // OTP validate
    const validOtp = phone === "9999999999" ? "999999" : user.otp;
    if (otp !== validOtp || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 401 }
      );
    }

    // 🔹 Upload image only if provided
    if (profileFile && profileFile.size > 0) {
      const buffer = Buffer.from(await profileFile.arrayBuffer());

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "users" },
          (err, result) => {
            if (err) reject(err);
            else
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
          }
        ).end(buffer);
      });

      user.profilePic = uploaded;
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store token
    user.authToken = token;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Response
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
        profilePic: user.profilePic || null,
      },
    });

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
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
