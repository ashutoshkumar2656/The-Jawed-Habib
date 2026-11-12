import * as React from "react";
import { PaymentsManagementHub } from "@/components/admin/payments-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bridal Payments & Balance Settlement | The Jawed Habib Salon – Lalganj",
};

export default function BridalPaymentsPage() {
  return <PaymentsManagementHub />;
}
