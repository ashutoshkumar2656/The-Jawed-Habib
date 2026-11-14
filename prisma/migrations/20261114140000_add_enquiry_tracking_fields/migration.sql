-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "enquiryNumber" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'Website Contact Form';
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "emailStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "googleSheetsStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP(3);
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "sheetsSyncedAt" TIMESTAMP(3);
ALTER TABLE "Enquiry" ADD COLUMN IF NOT EXISTS "lastError" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Enquiry_enquiryNumber_key" ON "Enquiry"("enquiryNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");
