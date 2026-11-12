import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { adminRefundSchema } from "@/lib/validation/schemas";
import { checkAdminAuth } from "@/lib/auth/rbac";
import { createRazorpayRefund } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = adminRefundSchema.safeParse({
      ...body,
      paymentTransactionId: params.id,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid refund payload",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { amount, reason, isFullRefund } = validation.data;
    const tx = await dbRepo.getPaymentTransactionById(params.id);

    if (!tx) {
      return NextResponse.json(
        { success: false, error: "Transaction not found." },
        { status: 404 }
      );
    }

    if (tx.status !== "CAPTURED") {
      return NextResponse.json(
        { success: false, error: "Only successfully captured transactions can be refunded." },
        { status: 400 }
      );
    }

    const currentRefunded = tx.refundedAmount || 0;
    const remainingRefundable = tx.amount - currentRefunded;
    const refundAmount = isFullRefund ? remainingRefundable : amount;

    if (refundAmount <= 0 || refundAmount > remainingRefundable) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid refund amount ₹${refundAmount}. Maximum refundable amount is ₹${remainingRefundable}.`,
        },
        { status: 400 }
      );
    }

    // Call Razorpay Refund API if this was an online Razorpay transaction
    let rzpRefundId: string | undefined = undefined;
    if (tx.razorpayPaymentId && tx.environment !== "OFFLINE") {
      const creds = await dbRepo.getRazorpayCredentials(tx.environment);
      const rzpRefund = await createRazorpayRefund(
        {
          paymentId: tx.razorpayPaymentId,
          amountInPaise: Math.round(refundAmount * 100),
          reason,
          notes: {
            transactionId: tx.id,
            adminUser: auth.user?.name || "Admin",
            branch: "Lalganj",
          },
        },
        creds.keyId,
        creds.keySecret
      );
      rzpRefundId = rzpRefund.id;
    }

    // Record refund in database & update transaction status
    const refundRecord = await dbRepo.recordPaymentRefund({
      transactionId: tx.id,
      amount: refundAmount,
      reason,
      initiatedBy: `${auth.user?.name || "Admin"} (${auth.user?.role || "ADMIN"})`,
      razorpayRefundId: rzpRefundId,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed refund of ₹${refundAmount}.`,
      data: refundRecord,
    });
  } catch (error: any) {
    console.error("Refund processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
