-- Migration: 20261112000000_optimize_performance_indexes
-- Description: Adds high-performance single and composite indexes for appointments, payments, services, and customers without destructive changes.

-- 1. Appointment package relationship & composite query performance
CREATE INDEX IF NOT EXISTS "Appointment_packageId_idx" ON "Appointment"("packageId");
CREATE INDEX IF NOT EXISTS "Appointment_appointmentDate_status_idx" ON "Appointment"("appointmentDate", "status");
CREATE INDEX IF NOT EXISTS "Appointment_customerProfileId_status_idx" ON "Appointment"("customerProfileId", "status");

-- 2. Service catalog category & featured active filtering
CREATE INDEX IF NOT EXISTS "Service_categoryId_isActive_idx" ON "Service"("categoryId", "isActive");
CREATE INDEX IF NOT EXISTS "Service_isFeatured_isActive_idx" ON "Service"("isFeatured", "isActive");

-- 3. Payment transaction tracking & reporting timeline
CREATE INDEX IF NOT EXISTS "PaymentRecord_gatewayPaymentId_idx" ON "PaymentRecord"("gatewayPaymentId");
CREATE INDEX IF NOT EXISTS "PaymentRecord_createdAt_idx" ON "PaymentRecord"("createdAt");

-- 4. Offline counter payment timeline & date tracking
CREATE INDEX IF NOT EXISTS "OfflinePaymentRecord_createdAt_idx" ON "OfflinePaymentRecord"("createdAt");
CREATE INDEX IF NOT EXISTS "OfflinePaymentRecord_receivedDate_idx" ON "OfflinePaymentRecord"("receivedDate");

-- 5. Customer VIP lifetime spend aggregation
CREATE INDEX IF NOT EXISTS "CustomerProfile_totalSpent_idx" ON "CustomerProfile"("totalSpent");

-- 6. Payment refund auditing & tracking
CREATE INDEX IF NOT EXISTS "PaymentRefundRecord_razorpayRefundId_idx" ON "PaymentRefundRecord"("razorpayRefundId");
CREATE INDEX IF NOT EXISTS "PaymentRefundRecord_createdAt_idx" ON "PaymentRefundRecord"("createdAt");
