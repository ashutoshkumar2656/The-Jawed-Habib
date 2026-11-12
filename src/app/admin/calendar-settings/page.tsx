import * as React from "react";
import { CalendarManagementHub } from "@/components/admin/calendar-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendar Availability Settings | The Jawed Habib Salon – Lalganj",
};

export default function CalendarSettingsPage() {
  return <CalendarManagementHub />;
}
