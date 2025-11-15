import { connectDB } from "@/lib/dbConnect";
import ContactSection from "@/models/ContactSection";
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDB();
    const data = await ContactSection.findOne();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const exists = await ContactSection.findOne();
    if (exists) return NextResponse.json({
      success: false,
      message: "Already exists. Use PUT to update."
    }, { status: 400 });

    const newData = await ContactSection.create(body);

    return NextResponse.json({ success: true, data: newData });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}