
import { connectDB } from "@/lib/dbConnect";
import ContactSection from "@/models/ContactSection";
import { NextResponse } from "next/server";

// ✅ GET — Public API (for frontend store)
export async function GET() {
  try {
    await connectDB();

    // Fetch the single contact section record
    const data = await ContactSection.findOne().lean();

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Contact section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("Contact Section GET Error:", e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
