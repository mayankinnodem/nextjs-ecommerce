import { connectDB } from "@/lib/dbConnect";
import ContactSection from "@/models/ContactSection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const data = await ContactSection.findOne().lean();

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Contact section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Contact Section GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server Error",
      },
      { status: 500 }
    );
  }
}
