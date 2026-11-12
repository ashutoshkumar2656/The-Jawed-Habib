import * as React from "react";
import { SettingsManagementHub } from "@/components/admin/settings-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Salon Settings & Administration | The Jawed Habib Salon – Lalganj",
  description: "Official business coordinates, Razorpay gateway settings, security rules, and user administration.",
};

export default function SettingsPage() {
  return <SettingsManagementHub />;
}
