import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon Price List & Service Rate Card in Lalganj | The Jawed Habib Salon",
  description:
    "Complete transparent rate card for haircuts, hair spa, keratin treatments, hair color, facials, and bridal makeup at The Jawed Habib Salon, Lalganj, Vaishali.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Salon Price List & Rate Card | The Jawed Habib Salon Lalganj",
    description:
      "Transparent pricing for precision haircuts, L'Oreal hair treatments, bridal suites, and skincare at Tinpulwa Chowk, Lalganj.",
    url: "https://www.thejawedhabibsalons.in/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
