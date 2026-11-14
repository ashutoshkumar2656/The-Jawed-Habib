# Email System Setup & Deployment Guide

**The Jawed Habib Salon – Lalganj**  
Official Operational Guide for Transactional Customer Emails, Resend Integration, Domain Verification & Vercel Crons

---

## 1. Creating & Configuring Your Resend Account

1. Go to [https://resend.com](https://resend.com) and create an account using your salon administrative email (e.g. `admin@thejawedhabibsalons.in`).
2. Log into the Resend Dashboard: [https://resend.com/overview](https://resend.com/overview).

---

## 2. Verifying Your Custom Sender Domain

To achieve 100% inbox deliverability and prevent emails from landing in spam, verify your production domain (`thejawedhabibsalons.in`):

1. In the Resend Dashboard, navigate to **Domains** &rarr; **Add Domain**.
2. Enter your domain: `thejawedhabibsalons.in` (Region: default/Singapore/ap-southeast-1 or Global).
3. Resend will display DNS records to add at your DNS Registrar (e.g., Cloudflare, GoDaddy, Namecheap, or Hostinger):

| Type | Name / Host | Value / Target | Priority | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **TXT** | `resend._domainkey` | `k=rsa; p=...` (Provided by Resend) | — | DKIM Signing |
| **TXT** | `bounces` (or `@`) | `v=spf1 include:amazonses.com ~all` | — | SPF Authorization |
| **MX** | `bounces` | `feedback-smtp.ap-southeast-1.amazonses.com` | 10 | Return-Path |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@thejawedhabibsalons.in` | — | DMARC Policy |

4. Once added, click **Verify Domain**. DNS propagation typically takes between 2 to 30 minutes. Status will turn to green **Verified**.

> [!NOTE]
> During development or staging before DNS verification is complete, you can send test emails using `onboarding@resend.dev` to the email registered on your Resend account.

---

## 3. Obtaining Your API Key

1. In the Resend Dashboard, navigate to **API Keys** &rarr; **Create API Key**.
2. Name: `Production - Jawed Habib Lalganj Web`.
3. Permissions: **Full Access** (Sending Access).
4. Domain: `thejawedhabibsalons.in` (or All Domains).
5. Click **Add** and copy the generated key (`re_...`). Keep this key secret.

---

## 4. Configuring Environment Variables

### 4.1 Local Development (`.env`)
Add the following keys to your local `.env` file:

```env
# Resend Transactional Email API Key
RESEND_API_KEY="re_your_api_key_here"

# Verified Sender Email
EMAIL_FROM="The Jawed Habib Salon – Lalganj <notifications@thejawedhabibsalons.in>"

# Concierge Reply-To Email
EMAIL_REPLY_TO="support@thejawedhabibsalons.in"

# Secret token protecting scheduled reminder cron worker
CRON_SECRET="generate-a-strong-random-32-character-secret"
```

> [!TIP]
> If `RESEND_API_KEY` is omitted or left as a placeholder in `.env`, the system automatically activates **Sandbox Simulation Mode**. Emails are logged cleanly in terminal and database without crashing the application.

---

### 4.2 Production Deployment in Vercel Dashboard

1. Open your Vercel Project Dashboard: `https://vercel.com/your-team/jawed-habib-lalganj`.
2. Go to **Settings** &rarr; **Environment Variables**.
3. Add the following variables for **Production** and **Preview** environments:

| Key | Example Value | Sensitivity | Environment |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | `re_live_xxxxxxxxxxxx` | Secret | Production, Preview |
| `EMAIL_FROM` | `The Jawed Habib Salon – Lalganj <notifications@thejawedhabibsalons.in>` | Public | All |
| `EMAIL_REPLY_TO` | `support@thejawedhabibsalons.in` | Public | All |
| `CRON_SECRET` | *(Random 32-character hex token)* | Secret | Production |

---

## 5. Configuring the Scheduled Appointment Reminder (Vercel Cron)

The repository includes a root `vercel.json` configured with:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

- **Schedule:** Runs every 5 minutes (`*/5 * * * *`).
- **Authorization:** Vercel Cron automatically passes `Authorization: Bearer <CRON_SECRET>` on every invocation.
- **Manual Trigger for Testing:**
  You can test the reminder cron worker directly via terminal or curl:
  ```bash
  curl -X GET "https://www.thejawedhabibsalons.in/api/cron/reminders" \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```
  Expected response:
  ```json
  {
    "success": true,
    "message": "Processed 1 eligible appointments: 1 reminder(s) dispatched, 0 skipped.",
    "summary": { "eligibleCount": 1, "sentCount": 1, "skippedCount": 0, "errors": [] }
  }
  ```

---

## 6. How to Test Email Delivery in Production

### Test 1: Booking Confirmation
1. Visit `https://www.thejawedhabibsalons.in/booking` and submit a booking request using your own email address.
2. Check your inbox for subject:  
   `Your Appointment is Booked – The Jawed Habib Salon, Lalganj`.

### Test 2: Payment Receipt & PDF Attachment
1. Complete an advance payment in Razorpay Test Mode or record an offline cash payment in the Admin Portal.
2. Check your inbox for subject:  
   `Payment Receipt – The Jawed Habib Salon – [JH-LAL-2026-XXXXXX]`.
3. Open the attached file `Receipt-[BookingNumber].pdf` to inspect the vector tax invoice.

### Test 3: Post-Service Thank You
1. In Admin Bookings (`/admin/bookings`), change an appointment status to `COMPLETED`.
2. Check recipient inbox for subject:  
   `Thank You for Visiting – The Jawed Habib Salon, Lalganj`.

---

## 7. Inspecting Email Delivery Logs in the Admin Portal

1. Log into the Admin Portal at `/admin/bookings`.
2. Click the **Eye icon** on any booking row to open the details modal.
3. Scroll to the **Customer Email Delivery Outbox** panel:
   - Displays all transactional email events (`BOOKING_CONFIRMATION`, `PAYMENT_RECEIPT`, `APPOINTMENT_REMINDER`, `POST_SERVICE_THANK_YOU`).
   - Displays real-time status badge:
     - <span style="color: #34d399; font-weight: bold;">ACCEPTED / SENT</span>
     - <span style="color: #f59e0b; font-weight: bold;">PENDING</span>
     - <span style="color: #f43f5e; font-weight: bold;">FAILED</span>
   - If a delivery attempt fails due to temporary network issues, a **Retry** button is displayed to re-queue delivery with one click.
