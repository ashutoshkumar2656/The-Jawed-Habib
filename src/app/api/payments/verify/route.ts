import { NextRequest, NextResponse } from "next/server";
import { paymentVerifySchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = paymentVerifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment verification payload",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      appointmentId,
      transactionRef,
      gatewayPaymentId,
      gatewaySignature,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = validation.data;

    const orderId = razorpay_order_id || (transactionRef ? transactionRef.replace("TXN_", "").replace("ORDER_", "") : "");
    const paymentId = razorpay_payment_id || gatewayPaymentId || "";
    const signature = razorpay_signature || gatewaySignature || "";

    if (!paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay payment ID and signature are required for authoritative verification.",
        },
        { status: 400 }
      );
    }

    const appointment = await dbRepo.getAppointmentById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment record not found." },
        { status: 404 }
      );
    }

    // Retrieve active server-side Razorpay credentials
    const creds = await dbRepo.getRazorpayCredentials();

    // Verify HMAC SHA256 Signature using server secret
    const isSignatureValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
      keySecret: creds.keySecret,
    });

    if (!isSignatureValid) {
      console.warn("[PAYMENT_SIGNATURE_VERIFICATION_FAILED]", {
        appointmentId,
        orderId,
        paymentId,
        timestamp: new Date().toISOString(),
      });
      await dbRepo.verifyRazorpayPayment({
        appointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        signatureValid: false,
        failureReason: "HMAC SHA256 signature verification failed: potential tampering or invalid secret.",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: invalid signature. Transaction was recorded as FAILED.",
        },
        { status: 400 }
      );
    }

    // Process payment and update booking status
    const result = await dbRepo.verifyRazorpayPayment({
      appointmentId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      signatureValid: true,
    });

    return NextResponse.json({
      success: true,
      message: "Payment signature verified and marked as CAPTURED.",
      duplicate: !!result.isDuplicate,
      data: {
        paymentId: result.payment?.id,
        appointmentId,
        appointmentNumber: appointment.appointmentNumber,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        amount: result.payment?.amount,
        status: "CAPTURED",
        paymentStatus: result.appointment?.paymentStatus,
        remainingAmount: result.appointment?.remainingAmount,
      },
    });
  } catch (error: any) {
    console.error("[PAYMENT_VERIFICATION_ROUTE_ERROR]", {
      message: error?.message || "Internal error during payment verification.",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, error: error.message || "Internal error during payment verification." },
      { status: 500 }
    );
  }
}
