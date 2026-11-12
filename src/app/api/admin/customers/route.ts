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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;

    const customers = await dbRepo.getAllCustomers(search);
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("Admin customers GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}
