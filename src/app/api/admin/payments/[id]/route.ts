import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const transaction = await dbRepo.getPaymentTransactionById(params.id);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transaction details" },
      { status: 500 }
    );
  }
}
