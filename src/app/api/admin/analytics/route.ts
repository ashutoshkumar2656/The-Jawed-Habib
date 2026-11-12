import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const analytics = await dbRepo.getAdminAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
