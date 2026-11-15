# Razorpay Live Mode Final Owner Activation Runbook
**Project:** The Jawed Habib Salon – Lalganj  
**Production Website:** `https://www.thejawedhabibsalons.in`  
**Physical Address:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Vaishali, Bihar – 844121  
**Salon Contact Phones:** +91 7707000463 | +91 9831722983 | +91 9580000175  
**Salon Operating Hours:** Monday – Sunday, 10:00 AM – 10:00 PM (Open all 7 days)  
**Target Audience:** Salon Owner, Managing Partner & Senior DevOps Administrator  

---

## 1. Prerequisites (Complete Before Touching Vercel)

1. **Active Razorpay Merchant Account:**
   - Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
   - Verify that your Business KYC is marked as **Activated** and bank account verification is complete.
2. **Switch to Live Mode:**
   - In the top-left corner of the Razorpay Dashboard, toggle the switch from **Test Mode** to **Live Mode**.
   - The UI theme will switch from orange/yellow to blue/dark slate.

---

## 2. Step 1: Generate Live API Credentials

1. Navigate to **Account & Settings** > **API Keys**.
2. Click **Generate Live Key**.
3. A modal will display:
   - **Key ID:** Starts with `rzp_live_` (e.g. `rzp_live_abc123XYZ456`)
   - **Key Secret:** A 24+ character secret string.
4. **CRITICAL:** Copy and store the Key Secret immediately in a secure password manager. Razorpay will never display this secret again once the modal is closed.

---

## 3. Step 2: Configure Webhook in Razorpay Dashboard

1. Navigate to **Account & Settings** > **Webhooks**.
2. Click **+ Add New Webhook**.
3. Enter the following parameters:
   - **Webhook URL:** `https://www.thejawedhabibsalons.in/api/webhooks/razorpay`
   - **Secret:** Generate a strong random 32-character string (or use an existing team webhook secret). Save this as your `RAZORPAY_LIVE_WEBHOOK_SECRET`.
   - **Alert Email:** Enter salon admin email (e.g. `support@thejawedhabibsalons.in`).
4. Select the following **Active Events**:
   - `order.paid`
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
5. Click **Create Webhook**.

---

## 4. Step 3: Enable Automatic Payment Capture

1. In Razorpay Dashboard, navigate to **Account & Settings** > **Payment Capture**.
2. Select **Automatically capture payment**.
3. Choose **Immediately**.
4. Click **Save Settings**.

---

## 5. Step 4: Inject Environment Variables in Vercel Production

1. Open [Vercel Dashboard](https://vercel.com/dashboard) and navigate to **The Jawed Habib Salon – Lalganj** project.
2. Go to **Settings** > **Environment Variables**.
3. Add the following variables, checking **Production** only:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `RAZORPAY_ENVIRONMENT` | `LIVE` | Instructs backend payment engine to execute live transactions. |
| `RAZORPAY_LIVE_KEY_ID` | `rzp_live_...` (from Step 1) | Live API Key ID. |
| `RAZORPAY_LIVE_KEY_SECRET` | Secret from Step 1 | Live API Key Secret. |
| `RAZORPAY_LIVE_WEBHOOK_SECRET` | Secret from Step 2 | Live Webhook validation secret. |
| `NEXT_PUBLIC_PAYMENT_MODE` | `LIVE` | Switches client UI badge from "Test Mode" to Live. |

4. **Verify `ENCRYPTION_KEY`:** Ensure the pre-existing `ENCRYPTION_KEY` variable is untouched. Do not edit it.

---

## 6. Step 5: Trigger Production Redeployment

1. In Vercel, navigate to the **Deployments** tab.
2. Click the three dots `...` on the latest production deployment.
3. Select **Redeploy**.
4. In the confirmation dialog, uncheck "Use existing Build Cache" and click **Redeploy**.
5. Wait ~60 seconds until deployment shows status **Ready**.

---

## 7. Step 6: Live Payment Verification Test

1. On a mobile phone or personal computer, open:
   `https://www.thejawedhabibsalons.in/booking`
2. Select a quick service (e.g. "Hair Cut" or "Styling").
3. Select tomorrow's date and a slot.
4. Enter test details:
   - Name: `Salon Owner Live Test`
   - Phone: `7707000463`
   - Email: Your personal email.
5. Proceed to payment. Razorpay Checkout will load displaying **The Jawed Habib Salon** without any test banners.
6. Complete payment via UPI (GPay, PhonePe, or Paytm) or Debit Card for the advance token amount.
7. Verify:
   - Success screen renders booking confirmation ID (e.g. `JH-LLG-2026...`).
   - Confirmation SMS / Email arrives with salon address: *1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121*.
   - In Razorpay Dashboard, the transaction appears under **Payments** with status **Captured**.
   - In Admin Portal (`/admin/bookings`), the appointment appears with status **Confirmed**.

---

## 8. Rollback Runbook (In Case of Unforeseen Live Issue)

If you encounter any live verification issue (e.g. bank decline, webhook mismatch, or incorrect merchant setup):
1. Immediately go to Vercel **Settings** > **Environment Variables**.
2. Change:
   - `RAZORPAY_ENVIRONMENT` = `TEST`
   - `NEXT_PUBLIC_PAYMENT_MODE` = `TEST`
3. Click **Redeploy** on the latest deployment in Vercel.
4. The website instantly falls back to Test Mode within 60 seconds without disrupting salon operations or customer data.
