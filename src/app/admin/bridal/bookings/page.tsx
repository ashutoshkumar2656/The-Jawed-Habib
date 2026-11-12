import * as React from "react";
import { BookingsManagementHub } from "@/components/admin/bookings-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bridal Bookings Management | The Jawed Habib Salon – Lalganj",
};

export default function BridalBookingsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading bridal bookings...</div>}>
      <BookingsManagementHub />
    </React.Suspense>
  );
}
