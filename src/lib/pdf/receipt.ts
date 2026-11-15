/**
 * Server-Side PDF Payment Receipt Generator
 * The Jawed Habib Salon – Lalganj
 * Pure TypeScript PDF 1.4 Vector Generator (Zero External Dependencies)
 */

import { BRAND_CONFIG } from "@/lib/constants/brand";
import type { PaymentReceiptEmailPayload } from "../email/types";

function escapePdfText(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");
}

function formatInr(amount: number): string {
  return `INR ${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Builds a vector-rendered, production-grade PDF 1.4 receipt buffer.
 */
export function generateReceiptPdfBuffer(receipt: PaymentReceiptEmailPayload): Buffer {
  const streamCommands: string[] = [];

  // Helper operators
  const add = (cmd: string) => streamCommands.push(cmd);

  // Background page subtle tone
  add("0.97 0.97 0.96 rg 0 0 595.28 841.89 re f");

  // Main Invoice Card Background (White card)
  add("1.0 1.0 1.0 rg 36 36 523.28 770 re f");
  add("0.85 0.82 0.78 RG 1 w 36 36 523.28 770 re S");

  // Luxury Top Gold Accent Header Bar
  add("0.776 0.647 0.420 rg 36 786 523.28 20 re f");

  // Salon Header Background (Dark Luxe)
  add("0.08 0.08 0.08 rg 36 710 523.28 76 re f");

  // Brand Titles inside Header
  add("BT /F2 18 Tf 1.0 1.0 1.0 rg 52 758 Td (THE JAWED HABIB SALON) Tj ET");
  add("BT /F2 10 Tf 0.874 0.792 0.620 rg 52 742 Td (LALGANJ, VAISHALI, BIHAR) Tj ET");
  add("BT /F1 8 Tf 0.70 0.70 0.70 rg 52 724 Td (1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opp. Manglam Mart - 844121) Tj ET");

  // Right-aligned header badge
  add("BT /F2 12 Tf 0.776 0.647 0.420 rg 380 754 Td (PAYMENT RECEIPT) Tj ET");
  add("BT /F1 8 Tf 0.9 0.9 0.9 rg 380 738 Td (TAX INVOICE & VOUCHER) Tj ET");
  const gstinLabel = BRAND_CONFIG.legal.gstin
    ? `GSTIN: ${BRAND_CONFIG.legal.gstin}`
    : "GSTIN: Unregistered / Composition";
  add(`BT /F1 7 Tf 0.7 0.7 0.7 rg 380 724 Td (${escapePdfText(gstinLabel)}) Tj ET`);

  // Metadata Grid Box
  add("0.95 0.95 0.94 rg 52 620 491.28 74 re f");
  add("0.85 0.82 0.78 RG 0.5 w 52 620 491.28 74 re S");

  // Left Column Metadata
  add("BT /F2 9 Tf 0.2 0.2 0.2 rg 64 676 Td (Receipt Number:) Tj ET");
  add(`BT /F2 9 Tf 0.776 0.45 0.1 rg 140 676 Td (${escapePdfText(receipt.receiptNumber)}) Tj ET`);

  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 64 660 Td (Booking Reference:) Tj ET");
  add(`BT /F2 8 Tf 0.1 0.1 0.1 rg 140 660 Td (${escapePdfText(receipt.appointmentNumber)}) Tj ET`);

  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 64 644 Td (Payment Date:) Tj ET");
  add(`BT /F1 8 Tf 0.1 0.1 0.1 rg 140 644 Td (${escapePdfText(receipt.paymentDate)}) Tj ET`);

  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 64 628 Td (Payment Method:) Tj ET");
  add(`BT /F1 8 Tf 0.1 0.1 0.1 rg 140 628 Td (${escapePdfText(receipt.paymentMethod)}) Tj ET`);

  // Right Column Metadata
  add("BT /F2 9 Tf 0.2 0.2 0.2 rg 310 676 Td (Billed To:) Tj ET");
  add(`BT /F2 9 Tf 0.1 0.1 0.1 rg 365 676 Td (${escapePdfText(receipt.customer.name)}) Tj ET`);

  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 310 660 Td (Phone Number:) Tj ET");
  add(`BT /F1 8 Tf 0.1 0.1 0.1 rg 365 660 Td (+91 ${escapePdfText(receipt.customer.phone)}) Tj ET`);

  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 310 644 Td (Customer Email:) Tj ET");
  add(`BT /F1 8 Tf 0.1 0.1 0.1 rg 365 644 Td (${escapePdfText(receipt.customer.email || "N/A")}) Tj ET`);

  if (receipt.razorpayPaymentId) {
    add("BT /F1 8 Tf 0.4 0.4 0.4 rg 310 628 Td (Gateway Txn ID:) Tj ET");
    add(`BT /F1 8 Tf 0.05 0.5 0.2 rg 365 628 Td (${escapePdfText(receipt.razorpayPaymentId)}) Tj ET`);
  } else {
    add("BT /F1 8 Tf 0.4 0.4 0.4 rg 310 628 Td (Transaction Ref:) Tj ET");
    add(`BT /F1 8 Tf 0.1 0.1 0.1 rg 365 628 Td (${escapePdfText(receipt.transactionReference)}) Tj ET`);
  }

  // Table Header Box
  add("0.12 0.11 0.10 rg 52 575 491.28 24 re f");
  add("BT /F2 8 Tf 1.0 1.0 1.0 rg 64 584 Td (#) Tj ET");
  add("BT /F2 8 Tf 1.0 1.0 1.0 rg 85 584 Td (SERVICE / TREATMENT DESCRIPTION) Tj ET");
  add("BT /F2 8 Tf 1.0 1.0 1.0 rg 330 584 Td (TOTAL VALUE) Tj ET");
  add("BT /F2 8 Tf 1.0 1.0 1.0 rg 440 584 Td (PAYMENT STATUS) Tj ET");

  // Table Row 1 (Service Details)
  add("0.98 0.98 0.98 rg 52 535 491.28 40 re f");
  add("0.90 0.90 0.90 RG 0.5 w 52 535 491.28 40 re S");

  add("BT /F1 8 Tf 0.3 0.3 0.3 rg 64 555 Td (1) Tj ET");
  add(`BT /F2 8 Tf 0.1 0.1 0.1 rg 85 558 Td (${escapePdfText(receipt.serviceDescription)}) Tj ET`);
  add("BT /F1 7 Tf 0.4 0.4 0.4 rg 85 545 Td (Authorized salon treatment reservation at The Jawed Habib Lalganj) Tj ET");

  add(`BT /F2 8 Tf 0.1 0.1 0.1 rg 330 555 Td (${escapePdfText(formatInr(receipt.totalServiceAmount))}) Tj ET`);
  add(`BT /F2 8 Tf 0.776 0.45 0.1 rg 440 555 Td (${escapePdfText(receipt.paymentStatus)}) Tj ET`);

  // Financial Breakdown Card
  add("0.96 0.95 0.93 rg 280 395 263.28 125 re f");
  add("0.85 0.82 0.78 RG 0.5 w 280 395 263.28 125 re S");

  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 295 498 Td (Total Service Amount:) Tj ET");
  add(`BT /F2 8 Tf 0.1 0.1 0.1 rg 460 498 Td (${escapePdfText(formatInr(receipt.totalServiceAmount))}) Tj ET`);

  add("BT /F2 8 Tf 0.05 0.5 0.2 rg 295 476 Td (Amount Paid in This Transaction:) Tj ET");
  add(`BT /F2 9 Tf 0.05 0.5 0.2 rg 460 476 Td (${escapePdfText(formatInr(receipt.amountPaidInThisTransaction))}) Tj ET`);

  if (receipt.previouslyPaidAmount > 0) {
    add("BT /F1 8 Tf 0.4 0.4 0.4 rg 295 454 Td (Previously Paid Advance:) Tj ET");
    add(`BT /F1 8 Tf 0.3 0.3 0.3 rg 460 454 Td (${escapePdfText(formatInr(receipt.previouslyPaidAmount))}) Tj ET`);
  }

  // Divider inside summary
  add("0.85 0.82 0.78 RG 0.5 w 295 440 233 0.5 re S");

  add("BT /F2 9 Tf 0.776 0.45 0.1 rg 295 422 Td (Remaining Balance at Salon:) Tj ET");
  add(`BT /F2 10 Tf 0.776 0.45 0.1 rg 460 422 Td (${escapePdfText(formatInr(receipt.remainingBalance))}) Tj ET`);

  add("BT /F1 7 Tf 0.5 0.5 0.5 rg 295 406 Td (* Remaining balance payable at salon reception upon service) Tj ET");

  // Salon Notes & Instructions Box
  add("0.97 0.97 0.97 rg 52 395 215 125 re f");
  add("0.85 0.82 0.78 RG 0.5 w 52 395 215 125 re S");
  add("BT /F2 8 Tf 0.2 0.2 0.2 rg 62 500 Td (SALON POLICIES & GUIDELINES) Tj ET");
  add("BT /F1 7 Tf 0.3 0.3 0.3 rg 62 485 Td (1. Arrive 15 minutes before scheduled slot.) Tj ET");
  add("BT /F1 7 Tf 0.3 0.3 0.3 rg 62 472 Td (2. Carry this receipt or booking reference.) Tj ET");
  add("BT /F1 7 Tf 0.3 0.3 0.3 rg 62 459 Td (3. Advance deposits are applied directly to bill.) Tj ET");
  add("BT /F1 7 Tf 0.3 0.3 0.3 rg 62 446 Td (4. Rescheduling available up to 4 hrs prior.) Tj ET");
  add("BT /F1 7 Tf 0.3 0.3 0.3 rg 62 433 Td (5. Queries: +91 7707000463 / 9831722983) Tj ET");
  add("BT /F1 7 Tf 0.5 0.5 0.5 rg 62 410 Td (Thank you for choosing The Jawed Habib Lalganj!) Tj ET");

  // Payment Status Watermark / Stamp
  add("0.776 0.647 0.42 RG 1 w 52 335 491.28 42 re S");
  add("0.98 0.97 0.95 rg 53 336 489.28 40 re f");
  add("BT /F2 11 Tf 0.1 0.5 0.2 rg 70 352 Td ([ VERIFIED TRANSACTION ]  PAYMENT RECORDED & LOCKED) Tj ET");
  add("BT /F1 8 Tf 0.4 0.4 0.4 rg 380 352 Td (Computer Generated Official Tax Receipt) Tj ET");

  // Footer Signature & Verification
  add("0.85 0.82 0.78 RG 0.5 w 52 100 491.28 0.5 re S");
  add("BT /F2 8 Tf 0.3 0.3 0.3 rg 52 85 Td (The Jawed Habib Salon - Lalganj Branch Management) Tj ET");
  add("BT /F1 7 Tf 0.5 0.5 0.5 rg 52 74 Td (1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar - 844121) Tj ET");
  add("BT /F1 7 Tf 0.5 0.5 0.5 rg 52 63 Td (Direct Concierge: +91 7707000463 | Web: https://thejawedhabibsalons.in) Tj ET");
  add("BT /F2 7 Tf 0.776 0.647 0.420 rg 410 74 Td (AUTHORIZED RECEIPT) Tj ET");
  add("BT /F1 6 Tf 0.5 0.5 0.5 rg 410 63 Td (Valid without physical signature) Tj ET");

  const streamContent = streamCommands.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf8");

  // Build PDF Objects
  const objects: string[] = [];
  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  objects[2] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  objects[3] =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n";
  objects[4] = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  objects[5] = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";
  objects[6] = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  let pdfString = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [0];

  for (let i = 1; i <= 6; i++) {
    offsets[i] = Buffer.byteLength(pdfString, "utf8");
    pdfString += objects[i];
  }

  const xrefOffset = Buffer.byteLength(pdfString, "utf8");
  pdfString += "xref\n0 7\n0000000000 65535 f \n";
  for (let i = 1; i <= 6; i++) {
    pdfString += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdfString, "utf8");
}
