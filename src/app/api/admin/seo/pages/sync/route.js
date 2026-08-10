import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/authHelpers";
import { syncAllSeoPages } from "@/lib/seoSync";

export const POST = requireAdminAuth(async () => {
  try {
    const result = await syncAllSeoPages();
    return NextResponse.json({
      success: true,
      message: `Synced ${result.total} pages (${result.created} new, ${result.updated} updated)`,
      ...result,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});
