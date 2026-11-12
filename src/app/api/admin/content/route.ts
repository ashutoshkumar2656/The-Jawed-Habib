import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const settings = await dbRepo.getSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Admin content GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const updated = await dbRepo.updateSiteSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin content PUT error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update content" }, { status: 500 });
  }
}

export const POST = PUT;

