export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminSetting from "@/models/AdminSetting";
import { connectDB } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // Validate fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    const admin = await AdminSetting.findOne({ siteAdminEmail: email });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Email not found" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong password" },
        { status: 400 }
      );
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const res = NextResponse.json({
      success: true,
      message: "Login success",
      token,
    });

    res.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: false, // local dev
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
