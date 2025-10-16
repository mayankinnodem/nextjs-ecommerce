// src/app/api/attributes/route.js

import { connectDB } from "@/lib/dbConnect";
import Attribute from "@/models/Attribute";

export async function GET() {
  try {
    await connectDB();
    const attributes = await Attribute.find({});
    return new Response(JSON.stringify({ success: true, attributes }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, values } = body;

    const newAttr = new Attribute({ name, values });
    await newAttr.save();

    return new Response(JSON.stringify({ success: true, attribute: newAttr }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
