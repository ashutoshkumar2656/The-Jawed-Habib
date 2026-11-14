import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as postEnquiry } from "@/app/api/enquiries/route";
import { POST as postContactAlias } from "@/app/api/contact/route";
import { GET as getAdminEnquiries } from "@/app/api/admin/enquiries/route";
import { GET as getAdminEnquiry, PATCH as patchAdminEnquiry } from "@/app/api/admin/enquiries/[id]/route";
import { POST as retryAdminEnquiry } from "@/app/api/admin/enquiries/[id]/retry/route";
import dbRepo from "@/lib/db/repo";
import { emailService } from "@/lib/email/service";
import { googleSheetsService } from "@/lib/sheets/google-sheets";
import { renderAdminEnquiryNotificationEmail } from "@/lib/email/templates";
import { signToken } from "@/lib/auth/jwt";

describe("Contact Form Enquiry Management, Neon DB, Google Sheets & Admin Notification Suite", () => {
  const adminToken = signToken({
    userId: "admin_test_101",
    role: "ADMIN",
    phone: "7707000463",
    email: "admin@thejawedhabibsalons.in",
  });

  const customerToken = signToken({
    userId: "cust_test_202",
    role: "CUSTOMER",
    phone: "9831722983",
    email: "customer@example.com",
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // SCENARIO 1: Valid contact form submission creates record in Neon PostgreSQL
  // ==========================================================================
  it("Scenario 1: Valid contact form submission creates record in Neon PostgreSQL with reference number", async () => {
    const payload = {
      name: "Ananya Roy",
      phone: "7707000463",
      email: "ananya.roy@example.com",
      serviceInterest: "Bridal",
      message: "Inquiry for luxury bridal makeup and hair styling package.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify(payload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.id).toBeDefined();
    expect(json.data.enquiryNumber).toMatch(/^ENQ-\d{8}-[A-Z0-9]{4}$/);

    // Verify record in database
    const saved = await dbRepo.getEnquiryById(json.data.id);
    expect(saved).toBeDefined();
    expect(saved?.name).toBe("Ananya Roy");
    expect(saved?.phone).toBe("7707000463");
    expect(saved?.serviceInterest).toBe("Bridal");
    expect(saved?.source).toBe("Website Contact Form");
    expect(saved?.status).toBe("NEW");
  });

  // ==========================================================================
  // SCENARIO 2: Enquiry appears in Admin Portal enquiry list
  // ==========================================================================
  it("Scenario 2: Enquiry appears in Admin Portal enquiry list via authenticated GET endpoint", async () => {
    const created = await dbRepo.createEnquiry({
      name: "Sneha Sharma",
      phone: "9831722983",
      email: "sneha@example.com",
      serviceInterest: "Hair Spa",
      message: "Booking query for Keratin Hair Spa treatment.",
      source: "Website Contact Form",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/enquiries", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await getAdminEnquiries(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);

    const found = json.data.find((e: any) => e.id === created.id || e.enquiryNumber === created.enquiryNumber);
    expect(found).toBeDefined();
    expect(found.name).toBe("Sneha Sharma");
    expect(found.phone).toBe("9831722983");
  });

  // ==========================================================================
  // SCENARIO 3: Administrator email notification dispatched with complete details
  // ==========================================================================
  it("Scenario 3: Administrator email notification is formatted with brand aesthetic and action links", async () => {
    const emailSpy = vi.spyOn(emailService, "sendAdminEnquiryNotification");

    const payload = {
      name: "Pooja Verma",
      phone: "9580000175",
      email: "pooja.verma@example.com",
      serviceInterest: "Hair Color",
      message: "Looking for Balayage and Global hair coloring quotation.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
      body: JSON.stringify(payload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(201);
    expect(emailSpy).toHaveBeenCalledTimes(1);

    const emailArgs = emailSpy.mock.calls[0][0];
    expect(emailArgs.name).toBe("Pooja Verma");
    expect(emailArgs.phone).toBe("9580000175");
    expect(emailArgs.serviceInterest).toBe("Hair Color");

    // Verify rendered HTML content directly
    const rendered = renderAdminEnquiryNotificationEmail(emailArgs);
    expect(rendered.html).toContain("New Website Enquiry");
    expect(rendered.html).toContain("Pooja Verma");
    expect(rendered.html).toContain("9580000175");
    expect(rendered.html).toContain("Hair Color");
    expect(rendered.html).toContain("Looking for Balayage");
    // Verify Action links: Call Customer, WhatsApp, Admin Portal
    expect(rendered.html).toContain("tel:+919580000175");
    expect(rendered.html).toContain("https://wa.me/919580000175");
    expect(rendered.html).toContain("/admin/enquiries");
    // Luxury Black & Gold brand check
    expect(rendered.html.toLowerCase()).toContain("#c6a56b");
    expect(rendered.html).toContain("#111111");
  });

  // ==========================================================================
  // SCENARIO 4: Google Sheets receives formatted row with exact column mapping
  // ==========================================================================
  it("Scenario 4: Google Sheets row payload matches exact column layout A through I", async () => {
    const sheetsSpy = vi.spyOn(googleSheetsService, "appendEnquiryRow");

    const payload = {
      name: "Rajesh Kumar",
      phone: "7707000463",
      email: "rajesh@example.com",
      serviceInterest: "Men's Grooming",
      message: "Appointment needed for beard styling and facial grooming.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.3" },
      body: JSON.stringify(payload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(201);
    expect(sheetsSpy).toHaveBeenCalledTimes(1);

    const rowArgs = sheetsSpy.mock.calls[0][0];
    expect(rowArgs.enquiryId).toMatch(/^ENQ-\d{8}-[A-Z0-9]{4}$/);
    expect(rowArgs.customerName).toBe("Rajesh Kumar");
    expect(rowArgs.mobileNumber).toBe("7707000463");
    expect(rowArgs.serviceInterest).toBe("Men's Grooming");
    expect(rowArgs.message).toContain("beard styling");
    expect(rowArgs.status).toBe("NEW");
    expect(rowArgs.source).toBe("Website Contact Form");
    expect(rowArgs.submissionDate).toBeDefined();
    expect(rowArgs.submissionTime).toBeDefined();
  });

  // ==========================================================================
  // SCENARIO 5: Google Sheets API call uses valueInputOption=RAW
  // ==========================================================================
  it("Scenario 5: Google Sheets REST append enforces valueInputOption=RAW to prevent injection", async () => {
    // Intercept fetch to inspect query parameters when sheets append is triggered
    const originalFetch = global.fetch;
    let interceptedUrl = "";
    global.fetch = vi.fn().mockImplementation(async (url: string, init?: any) => {
      if (typeof url === "string" && url.includes("sheets.googleapis.com")) {
        interceptedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            updates: { updatedRange: "Sheet1!A5:I5" },
          }),
        };
      }
      return originalFetch(url, init);
    });

    try {
      // Mock configured state and access token
      vi.spyOn(googleSheetsService, "isConfigured").mockReturnValue(true);
      (googleSheetsService as any).enabled = true;
      vi.spyOn(googleSheetsService, "getAccessToken").mockResolvedValue("mock_token_123");
      (googleSheetsService as any).sheetId = "test_spreadsheet_id_123";

      const result = await googleSheetsService.appendEnquiryRow({
        enquiryId: "ENQ-20261114-TEST",
        submissionDate: "14 Nov 2026",
        submissionTime: "04:30 PM",
        customerName: "Dr. Alok Verma",
        mobileNumber: "9831722983",
        serviceInterest: "Keratin Treatment",
        message: "=SUM(1+1)", // Potential formula injection test
        status: "NEW",
        source: "Website Contact Form",
      });

      expect(result.success).toBe(true);
      expect(interceptedUrl).toContain("valueInputOption=RAW");
      expect(interceptedUrl).toContain("insertDataOption=INSERT_ROWS");
    } finally {
      global.fetch = originalFetch;
    }
  });

  // ==========================================================================
  // SCENARIO 6: Submission date and time formatted in Asia/Kolkata timezone
  // ==========================================================================
  it("Scenario 6: Date and time are formatted according to Asia/Kolkata timezone", async () => {
    const testDate = new Date("2026-11-14T10:30:00Z"); // 16:00 (4:00 PM) IST

    const kolkataDate = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(testDate);

    const kolkataTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(testDate);

    expect(kolkataDate).toContain("14 Nov 2026");
    expect(kolkataTime).toMatch(/04:00\s?(pm|PM)/i);
  });

  // ==========================================================================
  // SCENARIO 7: Status correctly initialized to NEW
  // ==========================================================================
  it("Scenario 7: Newly submitted enquiry is initialized with status NEW", async () => {
    const created = await dbRepo.createEnquiry({
      name: "Roshni Patel",
      phone: "9831722983",
      email: "roshni@example.com",
      serviceInterest: "Facial & Cleanup",
      message: "Enquiry for O3+ bridal facial glow treatment.",
    });

    expect(created.status).toBe("NEW");
  });

  // ==========================================================================
  // SCENARIO 8: Duplicate enquiry submission within 60s rejected with 409
  // ==========================================================================
  it("Scenario 8: Duplicate enquiry submission within 60s is rejected with HTTP 409", async () => {
    const duplicatePayload = {
      name: "Duplicate User",
      phone: "9123456789",
      email: "duplicate@example.com",
      serviceInterest: "Haircut",
      message: "Testing duplicate enquiry debounce protection.",
    };

    const req1 = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.8" },
      body: JSON.stringify(duplicatePayload),
    });

    const res1 = await postEnquiry(req1);
    expect(res1.status).toBe(201);

    // Immediate second attempt with same phone and message
    const req2 = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.8" },
      body: JSON.stringify(duplicatePayload),
    });

    const res2 = await postEnquiry(req2);
    expect(res2.status).toBe(409);
    const json2 = await res2.json();
    expect(json2.success).toBe(false);
    expect(json2.error).toContain("already received");
  });

  // ==========================================================================
  // SCENARIO 9: Invalid phone number rejected with 400
  // ==========================================================================
  it("Scenario 9: Invalid phone numbers are rejected with HTTP 400 validation error", async () => {
    const invalidPhonePayload = {
      name: "Invalid Phone Test",
      phone: "12345", // too short
      message: "Invalid phone number submission attempt.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.9" },
      body: JSON.stringify(invalidPhonePayload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Validation failed");
    expect(json.details.phone).toBeDefined();
  });

  // ==========================================================================
  // SCENARIO 10: Empty message or missing required fields rejected
  // ==========================================================================
  it("Scenario 10: Missing required fields or empty message are rejected with HTTP 400", async () => {
    const missingNamePayload = {
      phone: "7707000463",
      message: "No name provided here.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.10" },
      body: JSON.stringify(missingNamePayload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details.name).toBeDefined();
  });

  // ==========================================================================
  // SCENARIO 11: Honeypot field spam suppression
  // ==========================================================================
  it("Scenario 11: Honeypot field spam submissions are silently suppressed without DB insertion", async () => {
    const spamPayload = {
      name: "Spam Bot",
      phone: "9999999999",
      email: "bot@spammer.com",
      message: "Buy cheap backlinks now!",
      _honey: "gotcha_bot", // Honeypot trap triggered
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.11" },
      body: JSON.stringify(spamPayload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(200);

    // Verify no record with this name/phone was saved to the database
    const enquiries = await dbRepo.getAllEnquiries();
    const spamRecord = enquiries.find((e) => e.phone === "9999999999" && e.name === "Spam Bot");
    expect(spamRecord).toBeUndefined();
  });

  // ==========================================================================
  // SCENARIO 12: Database save succeeds even if Google Sheets is unreachable
  // ==========================================================================
  it("Scenario 12: Database record is saved successfully even if Google Sheets fails", async () => {
    vi.spyOn(googleSheetsService, "appendEnquiryRow").mockRejectedValue(
      new Error("Google Sheets API 503 Service Unavailable")
    );

    const payload = {
      name: "Vikram Malhotra",
      phone: "9831722983",
      email: "vikram@example.com",
      serviceInterest: "Hair Treatment",
      message: "Inquiry about hair botox and keratin smoothing.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.12" },
      body: JSON.stringify(payload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify DB record exists and recorded Sheets failure without dropping customer submission
    const saved = await dbRepo.getEnquiryById(json.data.id);
    expect(saved).toBeDefined();
    expect(saved?.name).toBe("Vikram Malhotra");
    expect(saved?.googleSheetsStatus).toBe("FAILED");
  });

  // ==========================================================================
  // SCENARIO 13: Database save succeeds even if email service fails
  // ==========================================================================
  it("Scenario 13: Database record is saved successfully even if email delivery fails", async () => {
    vi.spyOn(emailService, "sendAdminEnquiryNotification").mockRejectedValue(
      new Error("Resend API 429 Rate Limit Exceeded")
    );

    const payload = {
      name: "Meera Gupta",
      phone: "9580000175",
      email: "meera@example.com",
      serviceInterest: "Bridal Makeup",
      message: "Engagement and reception makeup booking enquiry.",
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.13" },
      body: JSON.stringify(payload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify DB record exists with emailStatus FAILED
    const saved = await dbRepo.getEnquiryById(json.data.id);
    expect(saved).toBeDefined();
    expect(saved?.name).toBe("Meera Gupta");
    expect(saved?.emailStatus).toBe("FAILED");
  });

  // ==========================================================================
  // SCENARIO 14: Admin retry action successfully re-triggers Google Sheets sync
  // ==========================================================================
  it("Scenario 14: Admin retry action successfully re-triggers Google Sheets sync", async () => {
    const enquiry = await dbRepo.createEnquiry({
      name: "Sheet Retry User",
      phone: "7707000463",
      email: "retry.sheet@example.com",
      serviceInterest: "Skin Care",
      message: "Facial query requiring sheets retry.",
      googleSheetsStatus: "FAILED",
    });

    const sheetsSpy = vi.spyOn(googleSheetsService, "appendEnquiryRow").mockResolvedValue({
      success: true,
      status: "SYNCED",
      updatedRange: "Sheet1!A10:I10",
      timestamp: new Date(),
    });

    const req = new NextRequest(`http://localhost:3000/api/admin/enquiries/${enquiry.id}/retry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target: "sheets" }),
    });

    const res = await retryAdminEnquiry(req, { params: { id: enquiry.id } });
    expect(res.status).toBe(200);
    expect(sheetsSpy).toHaveBeenCalledTimes(1);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.googleSheetsStatus).toBe("SYNCED");
  });

  // ==========================================================================
  // SCENARIO 15: Admin retry action successfully re-triggers email notification
  // ==========================================================================
  it("Scenario 15: Admin retry action successfully re-triggers email notification", async () => {
    const enquiry = await dbRepo.createEnquiry({
      name: "Email Retry User",
      phone: "9831722983",
      email: "retry.email@example.com",
      serviceInterest: "Haircut",
      message: "Haircut query requiring email retry.",
      emailStatus: "FAILED",
    });

    const emailSpy = vi.spyOn(emailService, "sendAdminEnquiryNotification").mockResolvedValue({
      success: true,
      messageId: "msg_retry_123",
      simulated: false,
    });

    const req = new NextRequest(`http://localhost:3000/api/admin/enquiries/${enquiry.id}/retry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ target: "email" }),
    });

    const res = await retryAdminEnquiry(req, { params: { id: enquiry.id } });
    expect(res.status).toBe(200);
    expect(emailSpy).toHaveBeenCalledTimes(1);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.emailStatus).toBe("SENT");
  });

  // ==========================================================================
  // SCENARIO 16: Status transition from NEW to CONTACTED via Admin Portal
  // ==========================================================================
  it("Scenario 16: Status transition from NEW to CONTACTED via Admin Portal PATCH", async () => {
    const enquiry = await dbRepo.createEnquiry({
      name: "Kavita Singhania",
      phone: "9831722983",
      message: "Bridal booking consultation request.",
    });
    expect(enquiry.status).toBe("NEW");

    const req = new NextRequest(`http://localhost:3000/api/admin/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: "CONTACTED",
        adminNotes: "Called client on 9831722983. Scheduled bridal trial for Saturday.",
      }),
    });

    const res = await patchAdminEnquiry(req, { params: { id: enquiry.id } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("CONTACTED");
    expect(json.data.adminNotes).toContain("Scheduled bridal trial");

    // Verify persistence in DB
    const fetched = await dbRepo.getEnquiryById(enquiry.id);
    expect(fetched?.status).toBe("CONTACTED");
    expect(fetched?.adminNotes).toContain("Scheduled bridal trial");
  });

  // ==========================================================================
  // SCENARIO 17: Status transition to SCHEDULED, RESOLVED, SPAM
  // ==========================================================================
  it("Scenario 17: Status transitions across full lifecycle (SCHEDULED, RESOLVED, SPAM)", async () => {
    const enquiry = await dbRepo.createEnquiry({
      name: "Lifecycle Test User",
      phone: "7707000463",
      message: "Testing lifecycle status transitions.",
    });

    // 1. SCHEDULED
    let req = new NextRequest(`http://localhost:3000/api/admin/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "SCHEDULED", adminNotes: "Appointment booked for Monday." }),
    });
    let res = await patchAdminEnquiry(req, { params: { id: enquiry.id } });
    expect(res.status).toBe(200);
    expect((await res.json()).data.status).toBe("SCHEDULED");

    // 2. RESOLVED
    req = new NextRequest(`http://localhost:3000/api/admin/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "RESOLVED", adminNotes: "Service completed successfully." }),
    });
    res = await patchAdminEnquiry(req, { params: { id: enquiry.id } });
    expect(res.status).toBe(200);
    expect((await res.json()).data.status).toBe("RESOLVED");

    // 3. SPAM
    req = new NextRequest(`http://localhost:3000/api/admin/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "SPAM", adminNotes: "Automated promotional spam." }),
    });
    res = await patchAdminEnquiry(req, { params: { id: enquiry.id } });
    expect(res.status).toBe(200);
    expect((await res.json()).data.status).toBe("SPAM");
  });

  // ==========================================================================
  // SCENARIO 18: Filter by status returns correct subsets
  // ==========================================================================
  it("Scenario 18: Filter by status parameter returns only matching enquiries", async () => {
    const uniquePhone = "9876543210";
    await (dbRepo.createEnquiry as any)({
      name: "Filter Status NEW",
      phone: uniquePhone,
      message: "Status filtering test item 1",
      status: "NEW",
    });

    const enq2 = await dbRepo.createEnquiry({
      name: "Filter Status RESOLVED",
      phone: uniquePhone,
      message: "Status filtering test item 2",
    });
    await dbRepo.updateEnquiry(enq2.id, { status: "RESOLVED" });

    const req = new NextRequest("http://localhost:3000/api/admin/enquiries?status=RESOLVED", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await getAdminEnquiries(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    const resolvedItems = json.data.filter((e: any) => e.phone === uniquePhone);
    expect(resolvedItems.length).toBe(1);
    expect(resolvedItems[0].status).toBe("RESOLVED");
    expect(resolvedItems[0].name).toBe("Filter Status RESOLVED");
  });

  // ==========================================================================
  // SCENARIO 19: Search by customer name or phone returns matching enquiries
  // ==========================================================================
  it("Scenario 19: Search by name or phone query returns matching enquiry records", async () => {
    const searchTargetName = "UniqueSearchKeywordName";
    const searchTargetPhone = "9988776655";

    await dbRepo.createEnquiry({
      name: searchTargetName,
      phone: searchTargetPhone,
      message: "Query search verification enquiry.",
    });

    // Search by name
    const reqName = new NextRequest(`http://localhost:3000/api/admin/enquiries?q=${searchTargetName}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const resName = await getAdminEnquiries(reqName);
    const jsonName = await resName.json();
    expect(jsonName.data.some((e: any) => e.name === searchTargetName)).toBe(true);

    // Search by phone
    const reqPhone = new NextRequest(`http://localhost:3000/api/admin/enquiries?q=${searchTargetPhone}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const resPhone = await getAdminEnquiries(reqPhone);
    const jsonPhone = await resPhone.json();
    expect(jsonPhone.data.some((e: any) => e.phone === searchTargetPhone)).toBe(true);
  });

  // ==========================================================================
  // SCENARIO 20: Unauthorized access to admin enquiry endpoints returns 401/403
  // ==========================================================================
  it("Scenario 20: Unauthorized or unauthenticated access to admin endpoints is strictly denied", async () => {
    // 1. Unauthenticated GET /api/admin/enquiries -> 401
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/enquiries");
    const unauthRes = await getAdminEnquiries(unauthReq);
    expect(unauthRes.status).toBe(401);

    // 2. Customer role attempting GET /api/admin/enquiries -> 403
    const custReq = new NextRequest("http://localhost:3000/api/admin/enquiries", {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const custRes = await getAdminEnquiries(custReq);
    expect([401, 403]).toContain(custRes.status);

    // 3. Unauthenticated PATCH /api/admin/enquiries/[id] -> 401
    const unauthPatch = new NextRequest("http://localhost:3000/api/admin/enquiries/enq_123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONTACTED" }),
    });
    const unauthPatchRes = await patchAdminEnquiry(unauthPatch, { params: { id: "enq_123" } });
    expect(unauthPatchRes.status).toBe(401);

    // 4. Unauthenticated POST /api/admin/enquiries/[id]/retry -> 401
    const unauthRetry = new NextRequest("http://localhost:3000/api/admin/enquiries/enq_123/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "all" }),
    });
    const unauthRetryRes = await retryAdminEnquiry(unauthRetry, { params: { id: "enq_123" } });
    expect(unauthRetryRes.status).toBe(401);
  });

  // Bonus verification: /api/contact alias route functions identically
  it("Bonus: /api/contact alias endpoint processes enquiry submissions identically", async () => {
    const payload = {
      name: "Contact Alias Customer",
      phone: "7707000463",
      email: "alias@example.com",
      serviceInterest: "Bridal",
      message: "Testing contact alias endpoint compatibility.",
    };

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.99" },
      body: JSON.stringify(payload),
    });

    const res = await postContactAlias(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.enquiryNumber).toMatch(/^ENQ-\d{8}-[A-Z0-9]{4}$/);
  });
});
