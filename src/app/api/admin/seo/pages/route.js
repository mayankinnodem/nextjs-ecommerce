import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/authHelpers";
import { getAllPageSeoRecords } from "@/lib/seo";

export const GET = requireAdminAuth(async () => {
  try {
    const pages = await getAllPageSeoRecords();
    return NextResponse.json({ success: true, pages });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});
