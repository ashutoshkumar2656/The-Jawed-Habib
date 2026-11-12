import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const status = searchParams.get("status") || undefined;
    const environment = searchParams.get("environment") || undefined;
    const paymentMethod = searchParams.get("paymentMethod") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await dbRepo.getPaymentTransactions({
      startDate,
      endDate,
      status,
      environment,
      paymentMethod,
      search,
    });

    return NextResponse.json({
      success: true,
      data: data.transactions,
      stats: data.stats,
      totalCount: data.totalCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
