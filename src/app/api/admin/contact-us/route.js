import { NextResponse } from "next/server";
import ContactSection from "@/models/ContactSection";
import { connectDB } from "@/lib/dbConnect";
import { findContactSectionDocument } from "@/lib/contactSectionQuery";
import { resolveDomain } from "@/lib/siteUrl";

export async function GET(request) {
  try {
    await connectDB();

    const domain = await resolveDomain(request);
    const data = await findContactSectionDocument(domain);

    return NextResponse.json({
      success: true,
      data: data || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const domain = await resolveDomain(req);

    if (domain) {
      body.domain = domain;
    }

    const existing = domain
      ? await findContactSectionDocument(domain)
      : await findContactSectionDocument();

    let saved;

    if (existing) {
      saved = await ContactSection.findByIdAndUpdate(existing._id, body, {
        new: true,
      });
    } else {
      saved = await ContactSection.create(body);
    }

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
