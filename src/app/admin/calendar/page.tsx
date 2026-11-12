import * as React from "react";
import { CalendarManagementHub } from "@/components/admin/calendar-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendar & Availability Settings | The Jawed Habib Salon – Lalganj",
  description: "Interactive visual calendar, operating hours, time slots, capacity, and holiday closures.",
};

export default function CalendarPage() {
  return <CalendarManagementHub />;
}
