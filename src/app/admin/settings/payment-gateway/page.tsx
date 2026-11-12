import { redirect } from "next/navigation";

export default function PaymentGatewaySettingsRedirect() {
  redirect("/admin/settings/razorpay");
}
