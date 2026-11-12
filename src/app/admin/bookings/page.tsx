import * as React from "react";
import { BookingsManagementHub } from "@/components/admin/bookings-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Management Hub | The Jawed Habib Salon – Lalganj",
  description: "Centralized appointment and bridal suite booking management, rescheduling, and balance settlement.",
};

export default function AdminBookingsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading booking management hub...</div>}>
      <BookingsManagementHub />
    </React.Suspense>
  );
}
