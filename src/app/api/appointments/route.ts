import { NextRequest, NextResponse } from "next/server";
import { appointmentBookingSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { getRequestSessionUser } from "@/lib/auth/session";
import { AppointmentStatus, BookingSource } from "@prisma/client";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import {
  checkRateLimit,
  checkDuplicateSubmission,
  sanitizeInput,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. IP-based rate limiting (15 requests per 10 minutes)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`booking_ip_${clientIp}`, 15);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many booking requests from this IP. Please wait a few minutes before trying again.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate payload
    const body = await req.json();
    const validatedData = appointmentBookingSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceIds,
      packageId,
      staffId,
      appointmentDate,
      startTime,
      couponCode,
      holdToken,
      notes,
      bridalRequirements,
      advanceAmount,
      source,
    } = validatedData.data;

    // 3. Duplicate submission check (prevents rapid double-clicks within 60s)
    const duplicateCheck = checkDuplicateSubmission(
      customerPhone,
      appointmentDate,
      startTime,
      60 * 1000
    );
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "A booking with this phone, date, and time slot was just submitted. Please wait before submitting again.",
          retryAfterSeconds: duplicateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 4. Past date restriction
    const todayStr = new Date().toISOString().split("T")[0];
    if (appointmentDate < todayStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment date cannot be in the past.",
        },
        { status: 400 }
      );
    }

    // 5. Sanitize text inputs
    const sanitizedName = sanitizeInput(customerName);
    const sanitizedNotes = sanitizeInput(notes);
    const sanitizedEmail = customerEmail ? sanitizeInput(customerEmail) : undefined;

    try {
      const appointment = await dbRepo.createAppointment({
        customerName: sanitizedName,
        customerPhone,
        customerEmail: sanitizedEmail,
        serviceIds,
        packageId: packageId || null,
        staffId: staffId || null,
        appointmentDate,
        startTime,
        couponCode: couponCode ? sanitizeInput(couponCode).toUpperCase() : null,
        holdToken: holdToken || null,
        notes: sanitizedNotes || null,
        bridalRequirements: bridalRequirements ? sanitizeInput(bridalRequirements) : null,
        advanceAmount,
        source: (source as BookingSource) || BookingSource.ONLINE_WEBSITE,
      });

      // 6. Generate verified WhatsApp click-to-chat URL
      const serviceNames =
        "appointmentServices" in appointment && Array.isArray(appointment.appointmentServices)
          ? appointment.appointmentServices.map((as: any) => as.service?.name || as.serviceId).join(", ")
          : "Salon Service";

      let packageName = "";
      if (appointment.packageId) {
        const pkg = await dbRepo.getPackageById(appointment.packageId);
        if (pkg) {
          packageName = pkg.name;
        }
      }

      const whatsappText = encodeURIComponent(
        `Hello The Jawed Habib Salon Lalganj!\n\nI have submitted an online appointment booking request:\n• Reference: ${appointment.appointmentNumber}\n• Customer: ${sanitizedName}\n• Service(s): ${serviceNames}${packageName ? `\n• Curated Package: ${packageName}` : ""}\n• Date: ${appointmentDate}\n• Preferred Time: ${startTime}\n\nKindly confirm my reservation.`
      );
      const whatsappUrl = `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=${whatsappText}`;

      return NextResponse.json(
        {
          success: true,
          message:
            "Your appointment booking request has been submitted successfully! It is currently pending confirmation by our Lalganj salon team.",
          data: {
            ...appointment,
            whatsappUrl,
            status: AppointmentStatus.PENDING,
          },
        },
        { status: 201 }
      );
    } catch (bookingError: unknown) {
      const errorMsg = (bookingError as Error).message || "Booking failed";
      if (errorMsg.includes("CONFLICT_DOUBLE_BOOKING")) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected time slot is no longer available. Please choose another time.",
            conflict: true,
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("API error in /api/appointments POST:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getRequestSessionUser(req);
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as AppointmentStatus) || undefined;
    const date = searchParams.get("date") || undefined;

    // If customer is logged in and not admin/staff, only return their appointments
    if (session) {
      const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(session.role);
      const appointments = await dbRepo.getAppointments({
        userId: isStaff ? undefined : session.userId,
        status,
        date,
      });

      return NextResponse.json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    }

    // Guest phone lookup
    const phone = searchParams.get("phone");
    if (phone) {
      const user = await dbRepo.findUserByPhoneOrEmail(phone);
      if (!user || !user.customerProfile) {
        return NextResponse.json({ success: true, count: 0, data: [] });
      }
      const appointments = await dbRepo.getAppointments({
        customerProfileId: user.customerProfile.id,
        status,
        date,
      });
      return NextResponse.json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Authentication required or provide ?phone=XXXXXXXXXX",
      },
      { status: 401 }
    );
  } catch (error) {
    console.error("API error in /api/appointments GET:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
