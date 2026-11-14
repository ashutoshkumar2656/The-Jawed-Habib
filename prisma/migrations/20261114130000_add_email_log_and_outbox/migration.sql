-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('BOOKING_CONFIRMATION', 'PAYMENT_RECEIPT', 'APPOINTMENT_REMINDER', 'POST_SERVICE_THANK_YOU');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'ACCEPTED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "paymentRecordId" TEXT,
    "offlinePaymentId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "eventType" "EmailEventType" NOT NULL,
    "deliveryStatus" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT,
    "lastError" TEXT,
    "providerMessageId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'RESEND',
    "sentAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_idempotencyKey_key" ON "EmailLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EmailLog_appointmentId_idx" ON "EmailLog"("appointmentId");

-- CreateIndex
CREATE INDEX "EmailLog_customerEmail_idx" ON "EmailLog"("customerEmail");

-- CreateIndex
CREATE INDEX "EmailLog_eventType_idx" ON "EmailLog"("eventType");

-- CreateIndex
CREATE INDEX "EmailLog_deliveryStatus_idx" ON "EmailLog"("deliveryStatus");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
