-- AlterEnum: Safely add CHECKED_IN to AppointmentStatus
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'CHECKED_IN';

-- AlterTable: Safely add customer snapshot and lifecycle timestamp fields to Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- CreateIndex: Add lookup indexes for fast phone and name searching
CREATE INDEX IF NOT EXISTS "Appointment_customerPhone_idx" ON "Appointment"("customerPhone");
CREATE INDEX IF NOT EXISTS "Appointment_customerName_idx" ON "Appointment"("customerName");

-- Data Backfill: Populate customerName, customerPhone, customerEmail on existing rows from User account
UPDATE "Appointment" a
SET 
  "customerName" = COALESCE(a."customerName", u."name"),
  "customerPhone" = COALESCE(a."customerPhone", u."phone"),
  "customerEmail" = COALESCE(a."customerEmail", u."email")
FROM "CustomerProfile" cp
JOIN "User" u ON u."id" = cp."userId"
WHERE a."customerProfileId" = cp."id"
  AND (a."customerName" IS NULL OR a."customerPhone" IS NULL);

