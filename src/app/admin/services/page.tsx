import * as React from "react";
import { ServicesManagementHub } from "@/components/admin/services-management-hub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bridal Services & Packages | The Jawed Habib Salon – Lalganj",
  description: "Manage bridal packages, salon services, pricing, durations, and category taxonomy.",
};

export default function ServicesPage() {
  return <ServicesManagementHub />;
}
