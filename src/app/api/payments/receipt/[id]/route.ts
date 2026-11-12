import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    // Look up by transaction ID, transaction ref, or appointment ID
    let tx = await dbRepo.getPaymentTransactionById(id);
    let apt: any = null;

    if (tx) {
      apt = tx.appointment;
    } else {
      apt = await dbRepo.getAppointmentById(id);
      if (apt) {
        const payments = await dbRepo.getPayments(apt.id);
        const latest = payments[0];
        if (latest) {
          tx = await dbRepo.getPaymentTransactionById(latest.id);
        }
      }
    }

    if (!apt && !tx) {
      return NextResponse.json(
        { success: false, error: "Receipt not found for this reference." },
        { status: 404 }
      );
    }

    const customerUser = apt?.customerProfile?.user;
    const services = apt?.appointmentServices?.map((as: any) => ({
      name: as.service?.name || "Salon Treatment",
      price: as.price || 0,
    })) || [];

    const amountPaid = tx?.amount ?? apt?.depositAmount ?? (apt?.paymentStatus === "PAID" ? apt?.totalAmount : 0);
    const totalAmount = apt?.totalAmount ?? tx?.amount ?? 0;
    const remainingBalance = apt?.remainingAmount ?? Math.max(0, totalAmount - amountPaid);

    const receipt = {
      receiptNumber: `RCPT-${apt?.appointmentNumber || tx?.id?.slice(0, 8).toUpperCase()}`,
      salon: {
        name: BRAND_CONFIG.fullName,
        branch: BRAND_CONFIG.branch,
        address: BRAND_CONFIG.location.fullAddress,
        phone: BRAND_CONFIG.contact.primaryPhone,
        secondaryPhone: BRAND_CONFIG.contact.secondaryPhone,
        gstin: "10AAACT0000A1Z5", // Bihar GST format
      },
      customer: {
        name: customerUser?.name || "Valued Client",
        phone: customerUser?.phone || "",
        email: customerUser?.email || null,
      },
      appointment: {
        id: apt?.id,
        number: apt?.appointmentNumber,
        date: apt?.appointmentDate,
        time: apt?.startTime,
        services,
      },
      payment: {
        transactionId: tx?.id || "N/A",
        transactionRef: tx?.transactionRef || "N/A",
        razorpayPaymentId: tx?.razorpayPaymentId || null,
        razorpayOrderId: tx?.razorpayOrderId || null,
        paymentMethod: tx?.paymentMethod || "Online Gateway",
        environment: tx?.environment || "TEST",
        totalAmount,
        amountPaid,
        remainingBalance,
        status: tx?.status || (apt?.paymentStatus === "PAID" ? "CAPTURED" : "PARTIALLY_PAID"),
        paymentDate: tx?.createdAt || apt?.updatedAt || new Date().toISOString(),
      },
    };

    return NextResponse.json({ success: true, data: receipt });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
