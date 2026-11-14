-- Migration: 20261113000000_production_database_architecture
-- Description: Establishes complete production database architecture with AdminSession, ServiceAddon, AppointmentAddon,
-- payment records, strict referential integrity, foreign key relations, and performance indexes without dropping existing data.

-- 1. AdminSession for persistent admin session management and token revocation
CREATE TABLE IF NOT EXISTS "AdminSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminSession_token_key" ON "AdminSession"("token");
CREATE INDEX IF NOT EXISTS "AdminSession_userId_idx" ON "AdminSession"("userId");
CREATE INDEX IF NOT EXISTS "AdminSession_token_idx" ON "AdminSession"("token");
CREATE INDEX IF NOT EXISTS "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdminSession_userId_fkey') THEN
        ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 2. ServiceAddon for authoritative dynamic add-on catalog management
CREATE TABLE IF NOT EXISTS "ServiceAddon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 15,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAddon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceAddon_slug_key" ON "ServiceAddon"("slug");
CREATE INDEX IF NOT EXISTS "ServiceAddon_slug_idx" ON "ServiceAddon"("slug");
CREATE INDEX IF NOT EXISTS "ServiceAddon_isActive_idx" ON "ServiceAddon"("isActive");
CREATE INDEX IF NOT EXISTS "ServiceAddon_serviceId_idx" ON "ServiceAddon"("serviceId");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceAddon_serviceId_fkey') THEN
        ALTER TABLE "ServiceAddon" ADD CONSTRAINT "ServiceAddon_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 3. AppointmentAddon for itemized add-on items within bookings
CREATE TABLE IF NOT EXISTS "AppointmentAddon" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentAddon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AppointmentAddon_appointmentId_addonId_key" ON "AppointmentAddon"("appointmentId", "addonId");
CREATE INDEX IF NOT EXISTS "AppointmentAddon_appointmentId_idx" ON "AppointmentAddon"("appointmentId");
CREATE INDEX IF NOT EXISTS "AppointmentAddon_addonId_idx" ON "AppointmentAddon"("addonId");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AppointmentAddon_appointmentId_fkey') THEN
        ALTER TABLE "AppointmentAddon" ADD CONSTRAINT "AppointmentAddon_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AppointmentAddon_addonId_fkey') THEN
        ALTER TABLE "AppointmentAddon" ADD CONSTRAINT "AppointmentAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "ServiceAddon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. PaymentRecord for online transaction tracking
CREATE TABLE IF NOT EXISTS "PaymentRecord" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'RAZORPAY',
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentRecord_transactionRef_key" ON "PaymentRecord"("transactionRef");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentRecord_gatewayPaymentId_key" ON "PaymentRecord"("gatewayPaymentId");
CREATE INDEX IF NOT EXISTS "PaymentRecord_appointmentId_idx" ON "PaymentRecord"("appointmentId");
CREATE INDEX IF NOT EXISTS "PaymentRecord_status_idx" ON "PaymentRecord"("status");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentRecord_appointmentId_fkey') THEN
        ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. RazorpayOrderRecord for backend order generation
CREATE TABLE IF NOT EXISTS "RazorpayOrderRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "amountInPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purpose" TEXT NOT NULL DEFAULT 'ADVANCE_DEPOSIT',
    "environment" TEXT NOT NULL DEFAULT 'TEST',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RazorpayOrderRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RazorpayOrderRecord_orderId_key" ON "RazorpayOrderRecord"("orderId");
CREATE INDEX IF NOT EXISTS "RazorpayOrderRecord_appointmentId_idx" ON "RazorpayOrderRecord"("appointmentId");
CREATE INDEX IF NOT EXISTS "RazorpayOrderRecord_orderId_idx" ON "RazorpayOrderRecord"("orderId");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RazorpayOrderRecord_appointmentId_fkey') THEN
        ALTER TABLE "RazorpayOrderRecord" ADD CONSTRAINT "RazorpayOrderRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. PaymentRefundRecord for authoritative refund auditing
CREATE TABLE IF NOT EXISTS "PaymentRefundRecord" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "razorpayRefundId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "initiatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentRefundRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PaymentRefundRecord_transactionId_idx" ON "PaymentRefundRecord"("transactionId");
CREATE INDEX IF NOT EXISTS "PaymentRefundRecord_appointmentId_idx" ON "PaymentRefundRecord"("appointmentId");
CREATE INDEX IF NOT EXISTS "PaymentRefundRecord_razorpayRefundId_idx" ON "PaymentRefundRecord"("razorpayRefundId");
CREATE INDEX IF NOT EXISTS "PaymentRefundRecord_createdAt_idx" ON "PaymentRefundRecord"("createdAt");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentRefundRecord_appointmentId_fkey') THEN
        ALTER TABLE "PaymentRefundRecord" ADD CONSTRAINT "PaymentRefundRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. OfflinePaymentRecord for counter balance receipts
CREATE TABLE IF NOT EXISTS "OfflinePaymentRecord" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionReference" TEXT,
    "receivedDate" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfflinePaymentRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OfflinePaymentRecord_appointmentId_idx" ON "OfflinePaymentRecord"("appointmentId");
CREATE INDEX IF NOT EXISTS "OfflinePaymentRecord_createdAt_idx" ON "OfflinePaymentRecord"("createdAt");
CREATE INDEX IF NOT EXISTS "OfflinePaymentRecord_receivedDate_idx" ON "OfflinePaymentRecord"("receivedDate");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OfflinePaymentRecord_appointmentId_fkey') THEN
        ALTER TABLE "OfflinePaymentRecord" ADD CONSTRAINT "OfflinePaymentRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. WebhookEventRecord for webhook deduplication
CREATE TABLE IF NOT EXISTS "WebhookEventRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'TEST',
    "payload" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEventRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WebhookEventRecord_eventId_key" ON "WebhookEventRecord"("eventId");
CREATE INDEX IF NOT EXISTS "WebhookEventRecord_eventId_idx" ON "WebhookEventRecord"("eventId");
CREATE INDEX IF NOT EXISTS "WebhookEventRecord_eventType_idx" ON "WebhookEventRecord"("eventType");

-- 9. Settings and Hold Records
CREATE TABLE IF NOT EXISTS "CalendarSettingRecord" (
    "id" TEXT NOT NULL DEFAULT 'calendar_settings_default',
    "data" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarSettingRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TimeSlotHoldRecord" (
    "id" TEXT NOT NULL,
    "holdToken" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "serviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customerPhone" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSlotHoldRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TimeSlotHoldRecord_holdToken_key" ON "TimeSlotHoldRecord"("holdToken");
CREATE INDEX IF NOT EXISTS "TimeSlotHoldRecord_holdToken_idx" ON "TimeSlotHoldRecord"("holdToken");
CREATE INDEX IF NOT EXISTS "TimeSlotHoldRecord_date_idx" ON "TimeSlotHoldRecord"("date");
CREATE INDEX IF NOT EXISTS "TimeSlotHoldRecord_expiresAt_idx" ON "TimeSlotHoldRecord"("expiresAt");

CREATE TABLE IF NOT EXISTS "PaymentGatewaySettingRecord" (
    "id" TEXT NOT NULL DEFAULT 'razorpay_settings',
    "data" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentGatewaySettingRecord_pkey" PRIMARY KEY ("id")
);
