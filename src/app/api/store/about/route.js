import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import About from "@/models/About";

export async function GET() {
await connectDB();
const about = await About.findOne();
return NextResponse.json({ success: true, about });
}