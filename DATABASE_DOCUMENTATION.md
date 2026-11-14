# Database Documentation: The Jawed Habib Salon – Lalganj

> **Document Location**: Full documentation available at [docs/DATABASE_DOCUMENTATION.md](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/docs/DATABASE_DOCUMENTATION.md)

---

## 1. Database Architecture & Engine

- **Provider**: Neon Serverless PostgreSQL (`postgresql://...`).
- **ORM**: Prisma ORM v5.22.0.
- **Migrations**: Version-controlled in `prisma/migrations/`.
- **Deploy Command**: `npm run prisma:deploy` (`prisma migrate deploy`).
- **Key Relational Models**:
  - `User`, `AdminSession`, `CustomerProfile`
  - `ServiceCategory`, `Service`, `ServiceAddon`
  - `Appointment`, `AppointmentAddon`
  - `PaymentTransaction`, `RazorpayOrderRecord`, `PaymentRefundRecord`, `OfflinePaymentRecord`
  - `PaymentGatewaySettingRecord`, `WebhookEventLog`, `AuditLog`
- **Monetary Precision**: All currency conversions use precise integer paise arithmetic (`₹1 = 100 paise`).
