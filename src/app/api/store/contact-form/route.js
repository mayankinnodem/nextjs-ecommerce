
import { connectDB } from "@/lib/dbConnect";
import ContactForm from "@/models/ContactForm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const saved = await ContactForm.create(body);

    return NextResponse.json({ success: true, data: saved });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}