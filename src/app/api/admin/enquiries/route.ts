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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || searchParams.get("search") || undefined;
    const enquiries = await dbRepo.getAllEnquiries(status, q);

    return NextResponse.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error: any) {
    console.error("Admin enquiries GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}
