import { redirect } from "next/navigation";

export default function RazorpaySettingsRedirect() {
  redirect("/admin/settings/payment-gateway");
}
