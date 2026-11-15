# Razorpay Payment Capture Architecture & Verification
**Project:** The Jawed Habib Salon – Lalganj  
**Production Domain:** `https://www.thejawedhabibsalons.in`  
**Physical Address:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
**Phones:** +91 7707000463 | +91 9831722983 | +91 9580000175  
**Version:** 1.0.0  

---

## 1. Payment Capture Models in Razorpay

In Razorpay, payments operate under a two-stage lifecycle:
1. **Authorization (`payment.authorized`):** The customer's bank holds the funds, confirming validity.
2. **Capture (`payment.captured`):** The merchant requests the held funds to be debited and scheduled for settlement into the salon's bank account.

If an authorized payment is NOT captured within 5 days (or the merchant account's configured capture window), Razorpay automatically voids the authorization and returns funds to the customer.

---

## 2. Primary Capture Mechanism: Order-Level Auto-Capture

In `src/lib/payments/razorpay.ts:createRazorpayOrder()`:
```typescript
const payload: Record<string, any> = {
  amount: amountPaise,
  currency: currency.toUpperCase(),
  receipt: receiptId,
  payment_capture: autoCapture ? 1 : 0, // Defaults to 1 (Auto-capture enabled)
  notes: {
    appointmentId,
    customerName,
    customerPhone,
    salonBranch: "Lalganj, Vaishali, Bihar"
  }
};
```
- By specifying `payment_capture: 1` during order creation, Razorpay's checkout automatically captures the payment the instant the customer authorizes it (via UPI, Debit Card, Credit Card, or Netbanking).
- No additional API call is required for standard transactions.

---

## 3. Secondary Capture Mechanism: Explicit REST API Manual Capture

To handle edge cases where:
- The Razorpay merchant account has global auto-capture disabled, OR
- A payment callback times out while in `authorized` state,

The application provides an explicit capture function in `src/lib/payments/razorpay.ts`:
```typescript
export async function captureRazorpayPayment(
  paymentId: string,
  amountPaise: number,
  currency = "INR",
  envOverride?: "LIVE" | "TEST"
): Promise<{ success: boolean; data?: any; error?: string }> {
  const credentials = await dbRepo.getRazorpayCredentials(envOverride);
  const authHeader = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authHeader}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount: amountPaise, currency: currency.toUpperCase() })
  });

  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data?.error?.description || "Failed to capture payment" };
  }
  return { success: true, data };
}
```

---

## 4. Webhook Handling for `payment.authorized`

In `src/app/api/webhooks/razorpay/route.ts`:
```typescript
case "payment.authorized": {
  const payment = event.payload?.payment?.entity;
  if (payment?.id && payment?.amount) {
    // Automatically trigger manual capture if payment is only authorized
    const captureResult = await captureRazorpayPayment(payment.id, payment.amount, payment.currency || "INR");
    if (!captureResult.success) {
      logger.error(`[WEBHOOK_CAPTURE_FAILED] Failed to capture authorized payment ${payment.id}: ${captureResult.error}`);
    }
  }
  // Proceed with payment verification and booking confirmation
  ...
}
```

---

## 5. Razorpay Merchant Dashboard Configuration Requirement

To guarantee seamless payment flow, the salon owner must perform the following setting verification in the Razorpay Dashboard:
1. Log in to `https://dashboard.razorpay.com`.
2. Toggle to **Live Mode**.
3. Navigate to **Settings** > **Payment Capture**.
4. Ensure **Automatically capture payment** is selected.
5. Set auto-capture timeout to **Immediately** (or default recommended setting).

---

## 6. Summary of Capture Guarantees

| Scenario | System Behavior |
| :--- | :--- |
| **Normal Booking Checkout** | Captured immediately via `payment_capture: 1`. |
| **Merchant Auto-Capture Disabled** | Captured asynchronously via `payment.authorized` webhook. |
| **Temporary Network Interruption** | Reconciled via `order.paid` or manual capture fallback. |
| **Uncaptured Stuck Authorization** | Alert logged for admin inspection prior to 5-day expiration window. |
