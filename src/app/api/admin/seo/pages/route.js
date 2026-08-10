import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/authHelpers";
import { getAllPageSeoRecords } from "@/lib/seo";
import {
  createCustomPageSeo,
  syncAllSeoPages,
} from "@/lib/seoSync";
import { isValidSeoPath, normalizeSeoPath } from "@/lib/seoPath";

export const GET = requireAdminAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const shouldSync = searchParams.get("sync") !== "false";
    const pages = await getAllPageSeoRecords({ sync: shouldSync });
    return NextResponse.json({ success: true, pages });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});

export const POST = requireAdminAuth(async (req) => {
  try {
    const body = await req.json();
    const path = normalizeSeoPath(body.path || "");
    const label = (body.label || path).trim();

    if (!path || path === "") {
      return NextResponse.json(
        { success: false, error: "Path is required (e.g. /my-page)" },
        { status: 400 }
      );
    }

    if (!isValidSeoPath(path)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid path. Use lowercase letters, numbers and hyphens (e.g. /about-us or /bags/leather-wallet)",
        },
        { status: 400 }
      );
    }

    const page = await createCustomPageSeo({ path, label });
    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
});
