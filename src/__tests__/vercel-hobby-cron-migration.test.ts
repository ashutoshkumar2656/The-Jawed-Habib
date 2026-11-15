/**
 * Phase 7: Comprehensive Vercel Hobby Daily Cron & Reservation Expiry Verification Suite
 * The Jawed Habib Salon – Lalganj
 *
 * Verifies:
 * 1. vercel.json daily cron schedule ("0 0 * * *")
 * 2. On-demand availability-triggered reservation expiry
 * 3. Daily cron background expiry
 * 4. Protection of PAID, PARTIALLY_PAID, PHONE_CALL, and WALK_IN reservations
 * 5. Concurrency & idempotency of reservation cleanup
 * 6. Late payment handling after reservation expiry (both slot-available and slot-conflicted cases)
 * 7. Cron endpoint authentication & security (CRON_SECRET)
 * 8. Email reminder timing safeguards (preventing sending for past/started appointments)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import dbRepo from "@/lib/db/repo";
import emailService from "@/lib/email/service";
import { GET as getAvailability } from "@/app/api/appointments/availability/route";
import { GET as getCron, POST as postCron } from "@/app/api/cron/reminders/route";
import { NextRequest } from "next/server";
import { BookingSource, AppointmentStatus, PaymentStatus } from "@prisma/client";
import { getKolkataDateString, getKolkataTimeString } from "@/lib/utils/timezone";

describe("Vercel Hobby Daily Cron & Reservation Expiry Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // --------------------------------------------------------------------------
  // 1. VERCEL CONFIGURATION AUDIT
  // --------------------------------------------------------------------------
  describe("1. Vercel Hobby Cron Configuration", () => {
    it("configures exactly one once-daily cron schedule matching Vercel Hobby rules ('0 0 * * *')", () => {
      const vercelJsonPath = path.join(process.cwd(), "vercel.json");
      expect(fs.existsSync(vercelJsonPath)).toBe(true);

      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, "utf-8"));
      expect(Array.isArray(vercelConfig.crons)).toBe(true);
      expect(vercelConfig.crons.length).toBe(1);

      const cronJob = vercelConfig.crons[0];
      expect(cronJob.path).toBe("/api/cron/reminders");
      expect(cronJob.schedule).toBe("0 0 * * *"); // Once daily at 00:00 UTC (~05:30 IST)

      // Ensure no multi-times-per-day, hourly, or 5-minute schedules exist
      expect(cronJob.schedule).not.toContain("*/");
      expect(cronJob.schedule.split(" ")[0]).toBe("0");
      expect(cronJob.schedule.split(" ")[1]).toBe("0");
    });
  });

  // --------------------------------------------------------------------------
  // 2. RESERVATION EXPIRY & PROTECTION
  // --------------------------------------------------------------------------
  describe("2. Reservation Expiry Policies & Immune Bookings", () => {
    it("expires abandoned ONLINE_WEBSITE bookings older than 60 minutes", async () => {
      const targetDate = "2026-12-20";
      const apt = await dbRepo.createAppointment({
        customerName: "Stale Online Client",
        customerPhone: "9831722983",
        customerEmail: "stale@online.in",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "11:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      // Age the booking to 75 minutes ago
      const memApt = dbRepo._memoryDb.appointments.find((a) => a.id === apt.id);
      expect(memApt).toBeDefined();
      if (memApt) {
        memApt.createdAt = new Date(Date.now() - 75 * 60 * 1000);
      }

      const expiryResult = await dbRepo.expireAbandonedOnlineReservations(60);
      expect(expiryResult.dbCount + expiryResult.memCount).toBeGreaterThanOrEqual(1);

      const updated = await dbRepo.getAppointmentById(apt.id);
      expect(updated?.status).toBe(AppointmentStatus.CANCELLED);
      expect(updated?.adminNotes).toContain("Automated reservation expiry");
    });

    it("strictly preserves PHONE_CALL reservations even if created hours ago", async () => {
      const targetDate = "2026-12-21";
      const apt = await dbRepo.createAppointment({
        customerName: "Phone Call Client",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "12:00",
        source: BookingSource.PHONE_CALL,
      });

      const memApt = dbRepo._memoryDb.appointments.find((a) => a.id === apt.id);
      if (memApt) {
        memApt.createdAt = new Date(Date.now() - 120 * 60 * 1000); // 2 hours old
      }

      await dbRepo.expireAbandonedOnlineReservations(60);

      const checkApt = await dbRepo.getAppointmentById(apt.id);
      expect(checkApt?.status).toBe(AppointmentStatus.PENDING);
    });

    it("strictly preserves WALK_IN reservations even if created hours ago", async () => {
      const targetDate = "2026-12-22";
      const apt = await dbRepo.createAppointment({
        customerName: "Walk-in Client",
        customerPhone: "9580000175",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "14:00",
        source: BookingSource.WALK_IN,
      });

      const memApt = dbRepo._memoryDb.appointments.find((a) => a.id === apt.id);
      if (memApt) {
        memApt.createdAt = new Date(Date.now() - 180 * 60 * 1000); // 3 hours old
      }

      await dbRepo.expireAbandonedOnlineReservations(60);

      const checkApt = await dbRepo.getAppointmentById(apt.id);
      expect(checkApt?.status).toBe(AppointmentStatus.PENDING);
    });

    it("strictly preserves PARTIALLY_PAID and PAID online reservations from expiry", async () => {
      const targetDate = "2026-12-23";
      // Partially Paid
      const aptPartial = await dbRepo.createAppointment({
        customerName: "Partial Paid Client",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "15:00",
        source: BookingSource.ONLINE_WEBSITE,
      });
      const memPartial = dbRepo._memoryDb.appointments.find((a) => a.id === aptPartial.id);
      if (memPartial) {
        memPartial.createdAt = new Date(Date.now() - 90 * 60 * 1000);
        memPartial.paymentStatus = PaymentStatus.PARTIALLY_PAID;
        memPartial.depositAmount = 500;
      }

      // Fully Paid
      const aptPaid = await dbRepo.createAppointment({
        customerName: "Fully Paid Client",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "16:00",
        source: BookingSource.ONLINE_WEBSITE,
      });
      const memPaid = dbRepo._memoryDb.appointments.find((a) => a.id === aptPaid.id);
      if (memPaid) {
        memPaid.createdAt = new Date(Date.now() - 90 * 60 * 1000);
        memPaid.paymentStatus = PaymentStatus.PAID;
        memPaid.depositAmount = 1000;
      }

      await dbRepo.expireAbandonedOnlineReservations(60);

      const checkPartial = await dbRepo.getAppointmentById(aptPartial.id);
      const checkPaid = await dbRepo.getAppointmentById(aptPaid.id);

      expect(checkPartial?.status).toBe(AppointmentStatus.PENDING);
      expect(checkPaid?.status).toBe(AppointmentStatus.PENDING);
    });

    it("handles repeated/duplicate cleanup invocations idempotently", async () => {
      const firstRun = await dbRepo.expireAbandonedOnlineReservations(60);
      const secondRun = await dbRepo.expireAbandonedOnlineReservations(60);

      expect(secondRun.dbCount).toBe(0);
      expect(secondRun.memCount).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. ON-DEMAND AVAILABILITY CLEANUP
  // --------------------------------------------------------------------------
  describe("3. On-Demand Availability Cleanup", () => {
    it("cleans stale reservations on-demand when availability API is requested", async () => {
      const targetDate = "2026-12-25";
      const apt = await dbRepo.createAppointment({
        customerName: "On Demand Test Client",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "10:30",
        source: BookingSource.ONLINE_WEBSITE,
      });

      const memApt = dbRepo._memoryDb.appointments.find((a) => a.id === apt.id);
      if (memApt) {
        memApt.createdAt = new Date(Date.now() - 80 * 60 * 1000); // 80 mins old
      }

      // Request availability through API
      const req = new NextRequest(`http://localhost:3000/api/appointments/availability?date=${targetDate}&serviceIds=srv_1`);
      const res = await getAvailability(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);

      // Verify the slot at 10:30 is now available
      const slot1030 = body.data.slots.find((s: any) => s.time === "10:30");
      expect(slot1030).toBeDefined();
      expect(slot1030.isAvailable).toBe(true);

      // Verify the stale booking was cancelled
      const checkApt = await dbRepo.getAppointmentById(apt.id);
      expect(checkApt?.status).toBe(AppointmentStatus.CANCELLED);
    });

    it("safely handles concurrent availability queries without corrupting data", async () => {
      const targetDate = "2026-12-26";
      const req1 = new NextRequest(`http://localhost:3000/api/appointments/availability?date=${targetDate}&serviceIds=srv_1`);
      const req2 = new NextRequest(`http://localhost:3000/api/appointments/availability?date=${targetDate}&serviceIds=srv_1`);
      const req3 = new NextRequest(`http://localhost:3000/api/appointments/availability?date=${targetDate}&serviceIds=srv_1`);

      const [res1, res2, res3] = await Promise.all([
        getAvailability(req1),
        getAvailability(req2),
        getAvailability(req3),
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(200);
    });
  });

  // --------------------------------------------------------------------------
  // 4. LATE PAYMENT CALLBACK AFTER EXPIRATION
  // --------------------------------------------------------------------------
  describe("4. Late Payment Safety After Reservation Expiry", () => {
    it("Scenario A: Payment succeeds after expiry when slot is still free — confirms booking and logs reinstatement", async () => {
      const targetDate = "2026-12-27";
      const apt = await dbRepo.createAppointment({
        customerName: "Late Payer (Slot Free)",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "11:30",
        source: BookingSource.ONLINE_WEBSITE,
      });

      // Expire the appointment
      const memApt = dbRepo._memoryDb.appointments.find((a) => a.id === apt.id);
      if (memApt) {
        memApt.status = AppointmentStatus.CANCELLED;
        memApt.adminNotes = "Automated reservation expiry: Online payment was not completed within the 60-minute checkout window.";
      }

      // Simulate payment verification succeeding
      const verifyResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayPaymentId: "pay_test_late_free_001",
        razorpaySignature: "mock_sig_valid",
        signatureValid: true,
        amountInPaise: 50000, // ₹500
      });

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.latePaymentAfterExpiry).toBe(true);
      expect(verifyResult.slotConflict).toBe(false);

      // Durably recorded payment
      expect(verifyResult.payment).toBeDefined();
      expect(verifyResult.payment.status).toBe("SUCCESS");
      expect(verifyResult.payment.gatewayPaymentId).toBe("pay_test_late_free_001");

      // Appointment reinstated because slot was open
      const refetched = await dbRepo.getAppointmentById(apt.id);
      expect(refetched?.status).toBe(AppointmentStatus.CONFIRMED);
      expect(refetched?.depositAmount).toBe(500);
    });

    it("Scenario B: Payment succeeds after expiry when slot was rebooked — preserves payment, keeps CANCELLED, flags staff reconciliation", async () => {
      const targetDate = "2026-12-28";
      // 1. Initial appointment expires
      const expiredApt = await dbRepo.createAppointment({
        customerName: "Late Payer (Slot Taken)",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "13:00",
        source: BookingSource.ONLINE_WEBSITE,
      });
      const memExpired = dbRepo._memoryDb.appointments.find((a) => a.id === expiredApt.id);
      if (memExpired) {
        memExpired.status = AppointmentStatus.CANCELLED;
        memExpired.adminNotes = "Automated reservation expiry: Online payment was not completed within the 60-minute checkout window.";
      }

      // 2. Another customer books the same slot and confirms it
      const newCustomerApt = await dbRepo.createAppointment({
        customerName: "New Customer (Took Slot)",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        appointmentDate: targetDate,
        startTime: "13:00",
        source: BookingSource.ONLINE_WEBSITE,
      });
      const memNew = dbRepo._memoryDb.appointments.find((a) => a.id === newCustomerApt.id);
      if (memNew) {
        memNew.status = AppointmentStatus.CONFIRMED;
      }

      // 3. Late payment callback arrives for the expired booking
      const verifyResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: expiredApt.id,
        razorpayPaymentId: "pay_test_late_conflict_002",
        razorpaySignature: "mock_sig_valid",
        signatureValid: true,
        amountInPaise: 50000, // ₹500
      });

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.latePaymentAfterExpiry).toBe(true);
      expect(verifyResult.slotConflict).toBe(true);
      expect(verifyResult.requiresReconciliation).toBe(true);

      // Payment is NEVER silently lost
      expect(verifyResult.payment).toBeDefined();
      expect(verifyResult.payment.status).toBe("SUCCESS");
      expect(verifyResult.payment.gatewayPaymentId).toBe("pay_test_late_conflict_002");

      // Appointment does NOT create a false confirmation: remains CANCELLED with reconciliation notes
      const refetched = await dbRepo.getAppointmentById(expiredApt.id);
      expect(refetched?.status).toBe(AppointmentStatus.CANCELLED);
      expect(refetched?.adminNotes).toContain("[LATE_PAYMENT_RECONCILIATION]");
      expect(refetched?.depositAmount).toBe(500);
      expect(refetched?.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });

  // --------------------------------------------------------------------------
  // 5. CRON ENDPOINT AUTHENTICATION & EXECUTION
  // --------------------------------------------------------------------------
  describe("5. Daily Cron Endpoint Security & Behavior", () => {
    it("rejects unauthorized cron requests when CRON_SECRET is configured", async () => {
      process.env.CRON_SECRET = "secure_prod_cron_token_998877";

      const req = new NextRequest("http://localhost:3000/api/cron/reminders", {
        headers: { authorization: "Bearer invalid_secret_token" },
      });
      const res = await getCron(req);
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain("Unauthorized");
    });

    it("accepts authorized cron request and reports once-daily execution details", async () => {
      process.env.CRON_SECRET = "secure_prod_cron_token_998877";

      const req = new NextRequest("http://localhost:3000/api/cron/reminders", {
        headers: { authorization: "Bearer secure_prod_cron_token_998877" },
      });
      const res = await getCron(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.cronSchedule).toContain("0 0 * * *");
      expect(body.summary.reminders.status).toBe("PAUSED_DAILY_CRON");
      expect(body.summary.reservationsExpired).toBeDefined();
    });

    it("operates identically via POST method", async () => {
      process.env.CRON_SECRET = "secure_prod_cron_token_998877";

      const req = new NextRequest("http://localhost:3000/api/cron/reminders", {
        method: "POST",
        headers: { "x-cron-secret": "secure_prod_cron_token_998877" },
      });
      const res = await postCron(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 6. EMAIL REMINDER TIMING SAFEGUARDS
  // --------------------------------------------------------------------------
  describe("6. Email Reminder Timing Safeguards", () => {
    it("never sends an appointment reminder for a past appointment date", async () => {
      const pastApt = await dbRepo.createAppointment({
        customerName: "Past Date Client",
        customerPhone: "9831722983",
        customerEmail: "past@client.in",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-01",
        startTime: "10:00",
      });

      const res = await emailService.sendAppointmentReminder(pastApt.id);
      expect(res.success).toBe(false);
      expect(res.error).toContain("has already passed");
    });

    it("never sends an appointment reminder for an appointment that has already started or passed today", async () => {
      const todayKolkata = getKolkataDateString();

      // Create an appointment for tomorrow, then adjust time to earlier today to test timing guard
      const futureApt = await dbRepo.createAppointment({
        customerName: "Started Client",
        customerPhone: "9831722983",
        customerEmail: "started@client.in",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-12-30",
        startTime: "12:00",
      });

      const memApt = dbRepo._memoryDb.appointments.find((a) => a.id === futureApt.id);
      expect(memApt).toBeDefined();
      if (memApt) {
        memApt.appointmentDate = todayKolkata;
        const [curH, curM] = getKolkataTimeString().split(":").map(Number);
        const curTotal = curH * 60 + curM;
        const pastTotal = Math.max(0, curTotal - 10);
        const pastH = String(Math.floor(pastTotal / 60)).padStart(2, "0");
        const pastM = String(pastTotal % 60).padStart(2, "0");
        memApt.startTime = `${pastH}:${pastM}`;
      }

      const res = await emailService.sendAppointmentReminder(futureApt.id);
      expect(res.success).toBe(false);
      expect(res.error).toContain("has already started or passed");
    });
  });
});
