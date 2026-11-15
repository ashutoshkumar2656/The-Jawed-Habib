import { Metadata } from "next";
import PrivacyPolicyPage from "../privacy-policy/page";

export const metadata: Metadata = {
  title: "Privacy Policy | The Jawed Habib Salon Lalganj",
  description:
    "Official Privacy Policy for The Jawed Habib Salon in Lalganj, Bihar. Understand how we collect, use, and protect your contact, booking, and payment reference data.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
