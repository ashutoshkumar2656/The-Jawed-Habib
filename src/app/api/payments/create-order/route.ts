import { NextRequest, NextResponse } from "next/server";
import { paymentOrderSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rateLimit = checkRateLimit(`order_ip_${clientIp}`, 20, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many payment order requests. Please wait a few minutes before trying again.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = paymentOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment order request",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { appointmentId, paymentPurpose = "ADVANCE_DEPOSIT" } = validation.data;
    const appointment = await dbRepo.getAppointmentById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "This appointment has already been fully paid." },
        { status: 400 }
      );
    }

    // Read active Razorpay gateway credentials & configuration
    const creds = await dbRepo.getRazorpayCredentials();

    if (!creds.isEnabled || !creds.enableOnlinePayments) {
      return NextResponse.json(
        {
          success: false,
          error: "Online payments are currently disabled by salon management. Please choose 'Pay at Salon Counter'.",
        },
        { status: 403 }
      );
    }

    // Determine trusted server-side payable amount
    let payableINR = 0;
    let effectivePurpose: "ADVANCE_DEPOSIT" | "FULL_PAYMENT" | "REMAINING_BALANCE" = "ADVANCE_DEPOSIT";

    if (paymentPurpose === "FULL_PAYMENT") {
      if (!creds.enableFullPayments) {
        return NextResponse.json(
          { success: false, error: "Full online prepayment is not permitted by salon settings." },
          { status: 400 }
        );
      }
      payableINR = appointment.totalAmount;
      effectivePurpose = "FULL_PAYMENT";
    } else if (paymentPurpose === "REMAINING_BALANCE") {
      if (!creds.enableRemainingCollection) {
        return NextResponse.json(
          { success: false, error: "Online collection of remaining balance is not enabled." },
          { status: 400 }
        );
      }
      payableINR = (appointment.remainingAmount && appointment.remainingAmount > 0)
        ? appointment.remainingAmount
        : appointment.totalAmount;
      effectivePurpose = "REMAINING_BALANCE";
    } else {
      // ADVANCE_DEPOSIT (Default)
      if (!creds.enableAdvancePayments) {
        if (creds.enableFullPayments) {
          payableINR = appointment.totalAmount;
          effectivePurpose = "FULL_PAYMENT";
        } else {
          return NextResponse.json(
            { success: false, error: "Advance deposit payments are not enabled in settings." },
            { status: 400 }
          );
        }
      } else {
        payableINR = (appointment.depositAmount && appointment.depositAmount > 0)
          ? appointment.depositAmount
          : appointment.totalAmount;
        effectivePurpose = "ADVANCE_DEPOSIT";
      }
    }

    if (payableINR <= 0) {
      return NextResponse.json(
        { success: false, error: "Payable amount must be greater than zero." },
        { status: 400 }
      );
    }

    // Convert INR to Paise (₹500 = 50000 paise)
    const amountInPaise = Math.round(payableINR * 100);
    const receipt = `rcpt_${appointment.appointmentNumber}_${Date.now()}`;

    // Call Razorpay Orders API
    const rzpOrder = await createRazorpayOrder(
      {
        amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          appointmentId: appointment.id,
          appointmentNumber: appointment.appointmentNumber,
          purpose: effectivePurpose,
          environment: creds.environment,
          branch: BRAND_CONFIG.branch,
        },
      },
      creds.keyId,
      creds.keySecret
    );

    // Save order in database & initialize pending transaction
    await dbRepo.recordRazorpayOrder({
      appointmentId: appointment.id,
      orderId: rzpOrder.id,
      amountInPaise,
      currency: "INR",
      purpose: effectivePurpose,
      environment: creds.environment,
      metadata: {
        receipt,
        customerName: appointment.customerProfile?.user?.name || "Client",
        customerPhone: appointment.customerProfile?.user?.phone || "",
        appointmentNumber: appointment.appointmentNumber,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: rzpOrder.id,
        amount: payableINR,
        amountInPaise,
        currency: "INR",
        keyId: creds.keyId,
        environment: creds.environment,
        displayName: creds.displayName || BRAND_CONFIG.fullName,
        purpose: effectivePurpose,
        appointmentId: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
        customer: {
          name: appointment.customerProfile?.user?.name || "",
          phone: appointment.customerProfile?.user?.phone || "",
          email: appointment.customerProfile?.user?.email || "",
        },
      },
    });
  } catch (error: any) {
    console.error("Payment create-order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize payment gateway order" },
      { status: 500 }
    );
  }
}
