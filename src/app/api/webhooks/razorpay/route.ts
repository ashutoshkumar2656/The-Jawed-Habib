import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing X-Razorpay-Signature header" },
        { status: 400 }
      );
    }

    // Preserve raw request body as text for HMAC verification
    const rawBody = await req.text();
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON webhook payload" },
        { status: 400 }
      );
    }

    // Retrieve active credentials & webhook secret
    const creds = await dbRepo.getRazorpayCredentials();

    // Verify signature with webhook secret
    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
      webhookSecret: creds.webhookSecret,
    });

    if (!isValid) {
      console.warn("[RAZORPAY_WEBHOOK_SIGNATURE_FAILED]", {
        timestamp: new Date().toISOString(),
        hasSignature: !!signature,
      });
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const eventId = event.id || `evt_${Date.now()}`;
    const eventType = event.event;

    // Deduplication check
    const eventRecord = await dbRepo.recordWebhookEvent({
      eventId,
      eventType,
      environment: creds.environment,
      payload: event,
      isProcessed: true,
    });

    if (eventRecord.isDuplicate) {
      return NextResponse.json({
        status: "ok",
        message: "Duplicate webhook event already processed.",
        duplicate: true,
      });
    }

    // Process event types
    switch (eventType) {
      case "order.paid": {
        const orderPayload = event.payload?.order?.entity;
        const paymentPayload = event.payload?.payment?.entity;
        if (orderPayload) {
          const notes = orderPayload.notes || {};
          const appointmentId = notes.appointmentId;
          if (appointmentId && paymentPayload?.id) {
            await dbRepo.verifyRazorpayPayment({
              appointmentId,
              razorpayOrderId: orderPayload.id,
              razorpayPaymentId: paymentPayload.id,
              razorpaySignature: signature,
              signatureValid: true,
              amountInPaise: orderPayload.amount,
              method: paymentPayload.method,
            });
          }
        }
        break;
      }

      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        if (payment) {
          const notes = payment.notes || {};
          const appointmentId = notes.appointmentId;
          if (appointmentId) {
            await dbRepo.verifyRazorpayPayment({
              appointmentId,
              razorpayOrderId: payment.order_id,
              razorpayPaymentId: payment.id,
              razorpaySignature: signature,
              signatureValid: true,
              amountInPaise: payment.amount,
              method: payment.method,
            });
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        if (payment) {
          const notes = payment.notes || {};
          const appointmentId = notes.appointmentId;
          if (appointmentId) {
            await dbRepo.verifyRazorpayPayment({
              appointmentId,
              razorpayOrderId: payment.order_id,
              razorpayPaymentId: payment.id,
              razorpaySignature: signature,
              signatureValid: false,
              failureReason: payment.error_description || "Payment failed at gateway",
            });
          }
        }
        break;
      }

      case "refund.processed": {
        const refund = event.payload?.refund?.entity;
        if (refund && refund.payment_id) {
          const amountInINR = refund.amount / 100;
          const payments = await dbRepo.getPayments();
          const matchTx = payments.find((p) => p.gatewayPaymentId === refund.payment_id);
          if (matchTx) {
            await dbRepo.recordPaymentRefund({
              transactionId: matchTx.id,
              amount: amountInINR,
              reason: refund.notes?.reason || "Webhook confirmed refund",
              initiatedBy: "Razorpay Webhook",
              razorpayRefundId: refund.id,
            });
          }
        }
        break;
      }

      default:
        // Ignore unhandled informational events gracefully
        break;
    }

    return NextResponse.json({
      success: true,
      received: true,
      event: eventType,
      eventId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK_HANDLER_ERROR]", {
      message: error?.message || "Failed to process webhook",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}
