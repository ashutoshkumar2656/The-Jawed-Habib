# Razorpay Payment Gateway Setup & Operations Guide
## The Jawed Habib Salon – Lalganj

> **Document Location**: Full documentation available at [docs/PAYMENT_GATEWAY_SETUP.md](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/docs/PAYMENT_GATEWAY_SETUP.md)  
> **Dedicated Admin Portal**: `/admin/settings/payment-gateway`

---

## 1. Quick Start

1. Sign in to the Admin Dashboard as `SUPER_ADMIN` or `ADMIN`.
2. Navigate to **Settings → Payment Gateway** (`/admin/settings/payment-gateway`).
3. Select your active mode:
   - **Test Sandbox Mode (`TEST`)**: Safe simulated payments using Razorpay sandbox cards and test UPI.
   - **Live Production Mode (`LIVE`)**: Processes actual customer funds; requires verified credentials and explicit confirmation.
4. Enter credentials:
   - Test Key ID & Secret / Live Key ID & Secret
   - Webhook Secret
5. Click **Probe Connection** to verify REST API authentication.
6. Set advance booking policies:
   - Minimum advance (default: ₹1,000)
   - Maximum advance (default: ₹2,500)
   - Allow customer to select advance within bounds
7. Click **Save Settings & Encrypt** to encrypt credentials with AES-256-GCM and persist to Neon PostgreSQL.

---

## 2. Webhook Setup

- **Production Webhook URL**:  
  `https://thejawedhabibsalons.in/api/webhooks/razorpay`
- **Subscribed Events**:
  - `order.paid`
  - `payment.captured`
  - `payment.failed`
  - `refund.processed`
- **Idempotency**: All events are deduplicated using `WebhookEventLog`. Duplicate deliveries will not credit double balances.

---

## 3. Security Highlights

- **AES-256-GCM Encryption**: All secrets stored encrypted at rest with random 12-byte IV and 16-byte authentication tag.
- **Masked Presentation**: Secrets are never sent to frontend; displayed as `••••••••••••`.
- **Payment Mode Isolation**: Test payment IDs (`pay_test_...`) cannot verify Live booking orders.
