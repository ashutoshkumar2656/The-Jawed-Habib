import * as React from "react";
import { PaymentsManagementHub } from "@/components/admin/payments-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Ledger & Financials | The Jawed Habib Salon – Lalganj",
  description: "Comprehensive financial ledger, Razorpay online payments, and salon counter cash collection.",
};

export default function AdminPaymentsPage() {
  return <PaymentsManagementHub />;
}
