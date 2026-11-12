import * as React from "react";
import { BookingsManagementHub } from "@/components/admin/bookings-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Appointments & Bookings | The Jawed Habib Salon – Lalganj",
};

export default function AppointmentsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading appointments...</div>}>
      <BookingsManagementHub />
    </React.Suspense>
  );
}
