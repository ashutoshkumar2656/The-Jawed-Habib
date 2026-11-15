import { Metadata } from "next";
import TermsAndConditionsPage from "../terms-and-conditions/page";

export const metadata: Metadata = {
  title: "Terms and Conditions | The Jawed Habib Salon Lalganj",
  description:
    "Official customer terms and conditions for salon services, appointment booking, payments, and salon policies at The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsPage() {
  return <TermsAndConditionsPage />;
}
