import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { checkAdminAuth } from "@/lib/auth/rbac";
import { collectRemainingPaymentSchema } from "@/lib/validation/schemas";
import logger from "@/lib/logging/logger";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = collectRemainingPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid remaining balance payment payload",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { appointmentId, amount, paymentMethod, transactionReference, paymentDate, receivedBy, notes } = validation.data;

    // Check appointment existence
    const apt = await dbRepo.getAppointmentById(appointmentId);
    if (!apt) {
      return NextResponse.json(
        { success: false, error: "Booking not found with the provided ID." },
        { status: 404 }
      );
    }

    const outstandingBalance = apt.remainingAmount ?? (apt.totalAmount - (apt.depositAmount || 0));

    // Validation: Collected amount cannot exceed outstanding balance unless 0
    if (amount > outstandingBalance) {
      return NextResponse.json(
        {
          success: false,
          error: `Collected amount (₹${amount}) exceeds outstanding balance (₹${outstandingBalance}).`,
        },
        { status: 400 }
      );
    }

    // Record the offline balance payment
    const result = await dbRepo.recordOfflinePayment({
      appointmentId,
      amount,
      paymentMethod: paymentMethod === "OTHER" ? "CASH" : (paymentMethod as "CASH" | "UPI" | "CARD"),
      transactionReference: transactionReference || `BAL_SALON_${Date.now()}`,
      receivedDate: paymentDate,
      recordedBy: receivedBy || auth.user?.name || "Salon Receptionist",
      notes: notes || `Bridal salon remaining balance collection via ${paymentMethod}`,
    });

    const updatedApt = await dbRepo.getAppointmentById(appointmentId);
    const newRemaining = updatedApt?.remainingAmount ?? Math.max(0, outstandingBalance - amount);

    // If remaining balance is now 0, mark appointment status as CONFIRMED or COMPLETED if requested
    if (newRemaining === 0 && updatedApt && updatedApt.status === "PENDING") {
      await dbRepo.updateAppointmentStatus(appointmentId, { status: "CONFIRMED" });
    }

    // Build printable/downloadable itemized receipt payload
    const receipt = {
      receiptNumber: `RCPT-${Date.now().toString().slice(-6)}`,
      bookingId: apt.appointmentNumber,
      customerName: (apt as any).customerProfile?.user?.name || (apt as any).customerName || "Valued Bride",
      customerPhone: (apt as any).customerProfile?.user?.phone || (apt as any).customerPhone || "",
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.startTime,
      serviceName: (apt as any).appointmentServices?.[0]?.service?.name || "Bridal Service",
      totalServicePrice: apt.totalAmount,
      advancePaidOnline: apt.depositAmount || 0,
      collectedNow: amount,
      paymentMethod,
      transactionRef: transactionReference || result.transaction.transactionRef,
      newRemainingBalance: newRemaining,
      paymentStatus: newRemaining === 0 ? "PAID (Fully Settled)" : "PARTIALLY_PAID (Balance Pending)",
      receivedBy: receivedBy || auth.user?.name || "Salon Cashier",
      receivedAt: new Date().toISOString(),
      salonName: "The Jawed Habib Salon",
      salonAddress: "1st Floor, Tinpulwa Chowk, Lalganj, Bihar – 844121",
      salonPhone: "7707000463",
    };

    logger.audit(
      "bridal.remaining_balance_collected",
      { userId: auth.user?.userId, role: auth.user?.role },
      { appointmentId, amount, paymentMethod, newRemainingBalance: newRemaining }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully collected ₹${amount} via ${paymentMethod}. New remaining balance: ₹${newRemaining}.`,
      data: {
        ...result,
        updatedRemainingBalance: newRemaining,
        receipt,
      },
    });
  } catch (error: any) {
    console.error("Remaining balance collection error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record remaining balance collection" },
      { status: 500 }
    );
  }
}
